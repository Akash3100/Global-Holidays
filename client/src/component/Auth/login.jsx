import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import axios from 'axios';
import "./AuthForm.css";

const loadExternalScript = (src) => new Promise((resolve, reject) => {
  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript) {
    resolve();
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.defer = true;
  script.onload = resolve;
  script.onerror = () => reject(new Error('Unable to load login provider'));
  document.body.appendChild(script);
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialNotice, setSocialNotice] = useState('');

  const fromContext = location.state?.from;
  const redirectState = location.state?.redirectState;
  const getRedirectPath = () => {
    if (fromContext === 'explore') return '/londontour';
    if (fromContext === 'booking') return '/book';
    if (typeof fromContext === 'string' && fromContext.startsWith('/')) return fromContext;
    return '/';
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('/api/auth/login', { email, password });

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('registeredUser', JSON.stringify(data.user));

      alert(`Login Successfully! Welcome ${data.user.firstName}`);

      navigate(getRedirectPath(), { replace: true, state: redirectState });
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Incorrect email or password. Please try again.');
    }
  };

  const finishSocialLogin = ({ user, token }) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('registeredUser', JSON.stringify(user));
    alert(`Login Successfully! Welcome ${user.firstName}`);
    navigate(getRedirectPath(), { replace: true, state: redirectState });
  };

  const showSocialConfigError = (provider) => {
    const message = `${provider} login is not configured. Add the ${provider} client ID in your React environment file.`;
    setSocialNotice(message);
    alert(message);
  };

  const handleGoogleLogin = async () => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    if (!googleClientId || googleClientId.includes('your-google-oauth-client-id')) {
      showSocialConfigError('Google');
      return;
    }

    try {
      await loadExternalScript('https://accounts.google.com/gsi/client');

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (!tokenResponse.access_token) {
            alert('Google login was cancelled.');
            return;
          }

          try {
            const { data } = await axios.post('/api/auth/social-login', {
              provider: 'google',
              accessToken: tokenResponse.access_token,
            });
            finishSocialLogin(data);
          } catch (error) {
            alert(error.response?.data?.message || error.message || 'Unable to login with Google.');
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (error) {
      alert(error.message || 'Unable to start Google login.');
    }
  };

  const handleAppleLogin = async () => {
    const appleClientId = process.env.REACT_APP_APPLE_CLIENT_ID;

    if (!appleClientId) {
      showSocialConfigError('Apple');
      return;
    }

    try {
      await loadExternalScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');

      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      const identityToken = response?.authorization?.id_token;

      if (!identityToken) {
        alert('Apple login was cancelled.');
        return;
      }

      const { data } = await axios.post('/api/auth/social-login', {
        provider: 'apple',
        identityToken,
      });
      finishSocialLogin(data);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Unable to login with Apple.');
    }
  };

  return (
    <div className="auth-page-body">
      <Link to="/" className="home-corner-link" aria-label="Go to Home">
        <i className="ri-home-2-line"></i>
      </Link>
      <div className="auth-container">
        <div className="auth-navbar">
          <div className="auth-nav-title">Welcome Back</div>
          <p>Sign in to manage your Global Holidays trips and bookings.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-data-form">
          <div className="auth-input-group">
            <p>Email</p>
            <input
              className="auth-input-field"
              placeholder="Enter your mail Id"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <p>Password</p>
            <input
              className="auth-input-field"
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-below-row">
            <div className="auth-remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <div className="auth-forgot-password" style={{ cursor: 'pointer' }}>Forget your password?</div>
          </div>

          <button className="auth-btn-primary" type="submit">
            Login
          </button>
        </form>

        <div className="auth-social-login" aria-label="Social login options">
          <div className="auth-social-divider">
            <span>or continue with</span>
          </div>
          <div className="auth-social-buttons">
            <button className="auth-social-btn auth-social-btn--google" type="button" onClick={handleGoogleLogin}>
              <span className="auth-social-icon auth-social-icon--google" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.64v2.97h3.89c2.27-2.09 3.53-5.17 3.53-8.85z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-2.97c-1.08.72-2.45 1.15-4.04 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.06A11.98 11.98 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.31 14.35A7.18 7.18 0 0 1 4.93 12c0-.82.14-1.61.38-2.35V6.59H1.3A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.3 5.41l4.01-3.06z" />
                  <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.15 15.23 0 12 0A11.98 11.98 0 0 0 1.3 6.59l4.01 3.06C6.25 6.82 8.89 4.75 12 4.75z" />
                </svg>
              </span>
              <span>Google</span>
            </button>
            <button className="auth-social-btn auth-social-btn--apple" type="button" onClick={handleAppleLogin}>
              <i className="ri-apple-fill"></i>
              <span>Apple</span>
            </button>
          </div>
          {socialNotice && <p className="auth-social-notice">{socialNotice}</p>}
        </div>

        <div className="auth-footer-redirect">
          <span>Don't have an Account? </span>
          
          <Link to="/register" state={{ from: fromContext, redirectState }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
