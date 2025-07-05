import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      default: '123456',
      // required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: function () {
        return this.role === 'user' 
      },
      unique: true,
      sparse: true,
    },
    lastLogin: Date, // <-- This field must exist
    status: {
      type: String,
      enum: ['active', 'deactive', 'pending'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'superadmin'	],
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: 'default-avatar.png',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpire = Date.now() + 3600000; // 1 hour
  return token;
};

/**
 * @description Generate password reset token
 * @returns {string} Raw password reset token (not hashed)
 */
userSchema.methods.generateResetPasswordToken = function () {
  // Generate a random token
  const rawToken = crypto.randomBytes(20).toString('hex');
  console.log('Generated raw token in model:', rawToken);

  // Hash the token for storage in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  console.log('Hashed token for storage in model:', hashedToken);

  // Store the hashed token in the database
  this.resetPasswordToken = hashedToken;
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  // Return the raw token (not hashed) to be sent to the user
  return rawToken;
};

/**
 * @description Find user by email verification token
 * @param {string} token - Email verification token
 * @returns {Promise<User|null>} User document if found and token is valid
 */
userSchema.statics.findByEmailVerificationToken = async function (token) {
  return await this.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() },
  });
};

/**
 * @description Find user by password reset token
 * @param {string} hashedToken - Hashed password reset token
 * @returns {Promise<User|null>} User document if found and token is valid
 */
userSchema.statics.findByResetPasswordToken = async function (hashedToken) {
  console.log('Finding user by reset token (static method):', hashedToken);
  const user = await this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  console.log(
    'User found by reset token:',
    user ? user.email : 'No user found'
  );
  return user;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
