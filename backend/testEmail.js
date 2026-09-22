require('dotenv').config();
const nodemailer = require('nodemailer');

const sendTestEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `EstateFlow <${process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@estateflow.com'}>`,
      to: 'test@example.com', // Just to check if transport succeeds, or I can use my own email
      subject: 'Test Email from EstateFlow',
      html: '<h1>This is a test email</h1>',
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendTestEmail();
