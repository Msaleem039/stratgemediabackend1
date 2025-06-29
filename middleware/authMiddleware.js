import jwt from 'jsonwebtoken';
import User from '../model/usermodel.js';


/**
 * @description Middleware to protect routes by verifying JWT token
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} [req.headers.authorization] - Authorization header containing JWT token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Promise representing the authentication check
 * @throws {Error} If token is missing, invalid, or user not found
 *
 * @example
 * // Usage in route definition
 * router.get('/protected-route', protect, (req, res) => {
 *   // Access authenticated user via req.user
 *   const userId = req.user._id;
 * });
 *
 * @example
 * // Required Authorization header format
 * Authorization: Bearer <jwt_token>
 */
const protect = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Authorization denied, token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export { protect };
