const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT) return null;

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: EMAIL_USER ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
  });
};

const sendMail = async ({ to, subject, text, html, from }) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log('Mailer not configured â€” skipping email to', to);
      return;
    }

    const defaultFromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@example.com';
    const mailOptions = {
      from: from || `"Global Holidays" <${defaultFromAddress}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err.message || err);
  }
};

module.exports = { sendMail };
