const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"My Shop" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just log it
    // This way the main functionality won't be affected if email fails
  }
};

module.exports = { sendEmail }; 