const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER;

  if (!host || !user || !pass || !fromEmail) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, EMAIL_USER/SMTP_USER, EMAIL_PASS/SMTP_PASS, and SMTP_FROM_EMAIL in Render.');
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  // Define email options
  const mailOptions = {
    from: `EstateFlow <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${options.email}: ${info.messageId || info.response}`);
  return info;
};

module.exports = sendEmail;
