const sendEmail = async (options) => {
  const apiKey = process.env.API_KEY_FOR_EMAIL;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.EMAIL_USER;

  if (!apiKey || !fromEmail) {
    throw new Error('Email configuration is incomplete. Set API_KEY_FOR_EMAIL and SMTP_FROM_EMAIL in .env.');
  }

  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const payload = {
    sender: { email: fromEmail, name: 'EstateFlow' },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.html,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API Error:', errorData);
      throw new Error(`Email could not be sent: ${errorData}`);
    }

    const data = await response.json();
    console.log(`Email sent to ${options.email}: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
