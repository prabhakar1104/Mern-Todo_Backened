const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: 'heenamishra7658@gmail.com', 
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

module.exports = { sendEmail };