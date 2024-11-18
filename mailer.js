require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text) {
  const msg = {
    to, // Recipient's email
    from: process.env.SENDGRID_FROM_EMAIL, // Your verified sender email
    subject,
    text,
    // html: '<p>Your HTML content here</p>', // Optional HTML content
  };

  try {
    const response = await sgMail.send(msg);
    console.log(`Email sent successfully to: ${to}`);
    return response;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error; // Re-throw the error for handling in the main script
  }
}

module.exports = sendEmail;
