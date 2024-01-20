const nodemailer = require('nodemailer');

const sendResetPasswordEmail = (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'neffetiroya@gmail.com',
      pass: 'rourou14',
    },
  });

  const mailOptions = {
    from: 'your_email@example.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://your-app/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending reset password email:', error);
    } else {
      console.log('Reset password email sent:', info.response);
    }
  });
};

module.exports = { sendResetPasswordEmail };
