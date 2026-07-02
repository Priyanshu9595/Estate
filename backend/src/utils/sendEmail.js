const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: `EstateFlow <${process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@estateflow.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
