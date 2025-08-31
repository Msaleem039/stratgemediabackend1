import jwt from 'jsonwebtoken';


import { asyncHandler } from '../utlils/globalutils.js';
import User from '../model/usermodel.js';
import sendResponse from '../utlils/responseHelper.js';
import sendEmail from '../utlils/sendEmail.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, "erqdgkdsyrewit43252fgdskhfyrwehfdjkljytrigbgfgrw");

      // Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Please provide name, email, subject, and message.',
    });
  }

  // 1. Send email to admin
  try {
    await sendEmail({
      email: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      templatePath: 'contact-form-notification.ejs',
      templateData: {
        name,
        email,
        subject,
        message,
      },
    });
  } catch (emailError) {
    console.error('Error sending internal contact form email:', emailError);
    // Optionally, you can return an error here if you want to fail the request
  }

  // 2. Send confirmation email to the user
  try {
    await sendEmail({
      email: email,
      subject: 'Thank You for Your Inquiry',
      text: `Hello ${name},\n\nThank you for contacting us. We have received your message and will get back to you shortly.\n\nYour message summary:\nSubject: ${subject}\nMessage: ${message}\n\nBest regards,\nThe RV Team`,
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for contacting us. We have received your message and will get back to you shortly.</p>
        <p><strong>Your message summary:</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p>Best regards,<br>The RV Team</p>
      `,
    });
  } catch (emailError) {
    console.error('Error sending user confirmation email:', emailError);
    // Optionally, you can return an error here if you want to fail the request
  }

  // 3. Respond to the client
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Your message has been sent successfully!',
    data: {
      name,
      email,
      subject,
      message,
    },
  });
};