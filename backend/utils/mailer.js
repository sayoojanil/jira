const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async ({ to, subject, text, html }) => {
  const mailConfigured =
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_HOST;

  if (!mailConfigured) {
    // Fallback: log to file or console
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logPath = path.join(logDir, 'mail.log');
    const logEntry = `[${new Date().toISOString()}] To: ${to}\nSubject: ${subject}\nText: ${text}\nHTML: ${html}\n----------------------------------------\n`;

    fs.appendFileSync(logPath, logEntry);
    console.log(`[MOCK EMAIL SENT] to: ${to} | Subject: ${subject}. Content saved in backend/logs/mail.log`);
    return { mock: true, logPath };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '588'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Freelance Project Portal" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log(`[EMAIL SENT] ID: ${info.messageId}`);
  return info;
};

module.exports = { sendEmail };
