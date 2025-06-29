import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let html = '';

    // If templatePath is provided and is a non-empty string, use template rendering
    if (
      typeof options.templatePath === 'string' &&
      options.templatePath.trim() !== ''
    ) {
      const __filename = fileURLToPath(import.meta.url);
      const currentDirectory = path.dirname(__filename);
      const filePath = path.join(
        currentDirectory,
        '../template/email',
        options.templatePath
      );

      const template = await fs.readFile(filePath, 'utf-8');
      html = ejs.render(template, options.templateData || {});
    }

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      html,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;
