const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
    try {
        // Create a transporter using SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Change this if you use another provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Needs to be an App Password if using Gmail
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${info.response}`);
        return true;
    } catch (error) {
        console.error('Error sending email: ', error);
        return false;
    }
};

module.exports = sendEmail;
