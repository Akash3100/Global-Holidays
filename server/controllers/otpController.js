const otpStore = new Map();

const OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

const normalizePhoneNumber = (phone) => {
  const cleaned = String(phone || '').replace(/\D/g, '');
  if (!cleaned) return '';
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (cleaned.length > 0) return `+${cleaned}`;
  return '';
};

const sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
      res.status(400);
      throw new Error('Phone number is required to send OTP');
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      res.status(400);
      throw new Error('Invalid phone number format');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRATION_MS;

    console.log(`\n📱 [PHONE OTP REQUEST]`);
    console.log(`   Phone: ${normalizedPhone}`);
    console.log(`   Generated OTP: ${otp}`);

    otpStore.set(normalizedPhone, { otp, expiresAt });

    res.json({
      message: `Your OTP for ${normalizedPhone} is ${otp}. Use it within 5 minutes.`,
      otp,
      expiresIn: OTP_EXPIRATION_MS / 1000,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      res.status(400);
      throw new Error('Phone number and OTP are required for verification');
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      res.status(400);
      throw new Error('Invalid phone number format');
    }

    console.log(`\n🔐 [PHONE OTP VERIFICATION]`);
    console.log(`   Phone: ${normalizedPhone}`);
    console.log(`   OTP Provided: ${otp}`);

    const record = otpStore.get(normalizedPhone);
    if (!record) {
      console.log(`   ❌ No OTP found for this phone\n`);
      res.status(400);
      throw new Error('No OTP request found for this phone number');
    }

    if (record.expiresAt < Date.now()) {
      console.log(`   ❌ OTP Expired\n`);
      otpStore.delete(normalizedPhone);
      res.status(400);
      throw new Error('OTP has expired. Please request a new one.');
    }

    if (record.otp !== otp.trim()) {
      console.log(`   ❌ OTP Mismatch. Expected: ${record.otp}, Got: ${otp}\n`);
      res.status(400);
      throw new Error('The OTP provided is invalid');
    }

    console.log(`   ✅ OTP Verified Successfully\n`);
    otpStore.delete(normalizedPhone);
    res.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOtp, verifyOtp };
