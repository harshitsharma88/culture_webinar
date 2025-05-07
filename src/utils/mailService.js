// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.mailuser,
    pass: process.env.mailapppassword
  }
});

async function sendMail({ to, subject, htmlBody, cc }) {
  try {
    const mailOptions = {
      from: 'your-email@gmail.com',
      to,
      cc,
      subject,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent', info };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, message: 'Failed to send email', error };
  }
}

module.exports = { sendMail };
