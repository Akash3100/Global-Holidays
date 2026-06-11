const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const User = require('../models/User');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'supersecretkey';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const isStrongPassword = (password) => (
  password.length >= 8
  && /[A-Z]/.test(password)
  && /[^A-Za-z0-9]/.test(password)
);

const getJson = (url, options = {}) => new Promise((resolve, reject) => {
  const req = https.request(url, options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (res.statusCode >= 400) {
          reject(new Error(data.error_description || data.error || 'Unable to verify social login'));
          return;
        }
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });

  req.on('error', reject);
  req.end();
});

const verifyGoogleToken = async (accessToken) => {
  const data = await getJson('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!data.email) {
    throw new Error('Google account email is required');
  }

  return {
    providerId: data.sub,
    email: data.email,
    firstName: data.given_name || data.name || 'Traveler',
    lastName: data.family_name || '',
    picture: data.picture,
  };
};

const verifyAppleToken = async (identityToken) => {
  if (!process.env.APPLE_CLIENT_ID) {
    throw new Error('Apple login is not configured on the server');
  }

  const decoded = jwt.decode(identityToken, { complete: true });
  if (!decoded?.header?.kid) {
    throw new Error('Invalid Apple login token');
  }

  const keys = await getJson('https://appleid.apple.com/auth/keys');
  const jwk = keys.keys?.find((key) => key.kid === decoded.header.kid);
  if (!jwk) {
    throw new Error('Unable to verify Apple login token');
  }

  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const payload = jwt.verify(identityToken, publicKey, {
    algorithms: ['RS256'],
    audience: process.env.APPLE_CLIENT_ID,
    issuer: 'https://appleid.apple.com',
  });

  if (!payload.email) {
    throw new Error('Apple account email is required');
  }

  return {
    providerId: payload.sub,
    email: payload.email,
    firstName: payload.email.split('@')[0],
    lastName: '',
  };
};

const upsertSocialUser = async ({ provider, profile }) => {
  const email = profile.email.toLowerCase().trim();
  let user = await User.findOne({ email });

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), salt);

    user = await User.create({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      password,
      username: profile.firstName,
      profilePicture: profile.picture,
      authProvider: provider,
      providerId: profile.providerId,
    });
  } else {
    user.authProvider = user.authProvider || provider;
    user.providerId = user.providerId || profile.providerId;
    if (profile.picture && user.profilePicture !== profile.picture) {
      user.profilePicture = profile.picture;
    }
    await user.save();
  }

  return user;
};

const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, username, gender, dob } = req.body;

    if (!firstName || !email || !password) {
      res.status(400);
      throw new Error('Missing required registration fields');
    }

    if (!isStrongPassword(password)) {
      res.status(400);
      throw new Error('Password must be at least 8 characters and include one capital letter and one special character');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists with that email');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      username,
      gender,
      dob,
    });

    res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

const socialLoginUser = async (req, res, next) => {
  try {
    const { provider, accessToken, identityToken } = req.body;

    if (!provider || (!accessToken && !identityToken)) {
      res.status(400);
      throw new Error('Missing social login details');
    }

    let profile;
    if (provider === 'google') {
      profile = await verifyGoogleToken(accessToken);
    } else if (provider === 'apple') {
      profile = await verifyAppleToken(identityToken);
    } else {
      res.status(400);
      throw new Error('Unsupported social login provider');
    }

    const user = await upsertSocialUser({ provider, profile });

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

const devSocialLoginUser = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_SOCIAL_LOGIN !== 'true') {
      res.status(403);
      throw new Error('Development social login is disabled');
    }

    const { provider } = req.body;
    if (!['google', 'apple'].includes(provider)) {
      res.status(400);
      throw new Error('Unsupported social login provider');
    }

    const displayName = provider === 'google' ? 'Google Traveler' : 'Apple Traveler';
    const profile = {
      providerId: `${provider}-development-account`,
      email: `${provider}.account@globalholidays.local`,
      firstName: displayName,
      lastName: '',
    };
    const user = await upsertSocialUser({ provider, profile });

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, socialLoginUser, devSocialLoginUser };
