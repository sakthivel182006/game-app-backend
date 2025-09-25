const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // Gmail App Password (not normal password)
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certs (for dev)
  },
});

module.exports = transporter;
