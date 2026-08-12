const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@example.com",
    to,
    subject,
    html,
  };

  if (!transporter) {
    console.log("-------------------------------------------------");
    console.log(`[EMAIL DEV MODE] Suppressed email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}`);
    console.log("-------------------------------------------------");
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
    // Don't fail the request if email fails to send, just log it.
  }
};

const sendVerificationEmail = async (email, token) => {
  const subject = "Verify your email address";
  const html = `
    <h1>Email Verification</h1>
    <p>Please use the following token to verify your email address:</p>
    <br/>
    <strong>${token}</strong>
    <br/><br/>
    <p>This token is valid for a limited time.</p>
  `;

  await sendEmail({ to: email, subject, html });
};

const sendPasswordResetEmail = async (email, token) => {
  const subject = "Password Reset Request";
  const html = `
    <h1>Password Reset</h1>
    <p>We received a request to reset your password. Use the following token to reset it:</p>
    <br/>
    <strong>${token}</strong>
    <br/><br/>
    <p>If you did not request a password reset, please ignore this email. This token will expire soon.</p>
  `;

  await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
