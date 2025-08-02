import User from "../model/usermodel.js";
import catchAsyncError from "../utlils/catchAsyncError.js";
import { asyncHandler } from "../utlils/globalutils.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import sendResponse from "../utlils/responseHelper.js";
import sendEmail from "../utlils/sendEmail.js";
import crypto from 'crypto';

// export const register = asyncHandler(async(req,res)=>{
   
//     const data = req.body;
    
//     const {name, email, password}= data;
//     const hashpassword =await bcrypt.hash(password,10)
//     const response = await User.create({
//         name:name,
//         email:email,
//         password:hashpassword
//     })
//     res.status(201).json({
//         response,
//         message:"user registered successfully"
//     })
// })
// export const registerUser = catchAsyncError(async (req, res) => {
//     const { name, email, phone, role } = req.body;
  
//     // Basic field check
//     if (!name || !email || !role) {
//       return sendResponse(res, {
//         success: false,
//         statusCode: 400,
//         message: 'Please provide name, email, and role',
//       });
//     }
  
//     // Role validation
//     const validRoles = [ 'admin', 'user','superadmin'];
//     if (!validRoles.includes(role)) {
//       return sendResponse(res, {
//         success: false,
//         statusCode: 400,
//         message: 'Role must be superadmin, admin, or va',
//       });
//     }
  
//     // Check if phone is required based on role
//     if ((role === 'user') && !phone) {
//       return sendResponse(res, {
//         success: false,
//         statusCode: 400,
//         message: 'Phone number is required for VA and Admin',
//       });
//     }
//     const superadminExists = await User.exists({ role: 'superadmin' });
  
//     if (role === 'superadmin') {
//       // Only allow if no superadmin exists
//       if (superadminExists) {
//         return sendResponse(res, {
//           success: false,
//           statusCode: 403,
//           message: 'Superadmin already exists. Cannot create another.',
//         });
//       }
//       // No token required, proceed to create the first superadmin
//     } else {
//       // For admin/va, require superadmin token
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return sendResponse(res, {
//           success: false,
//           statusCode: 401,
//           message: 'Unauthorized: No token provided',
//         });
//       }
//       const token = authHeader.split(' ')[1];
//       let decoded;
//       try {
//         decoded = jwt.verify(token, process.env.JWT_SECRET);
//       } catch (err) {
//         return sendResponse(res, {
//           success: false,
//           statusCode: 401,
//           message: 'Unauthorized: Invalid token',
//         });
//       }
//       if (decoded.role !== 'superadmin') {
//         return sendResponse(res, {
//           success: false,
//           statusCode: 403,
//           message: 'Forbidden: Only superadmin can create users',
//         });
//       }
//     }
  
//     // Check if email or phone already used
//     if (await User.exists({ email })) {
//       return sendResponse(res, {
//         success: false,
//         statusCode: 400,
//         message: 'Email is already in use',
//       });
//     }
  
//     if (phone && (await User.exists({ phone }))) {
//       return sendResponse(res, {
//         success: false,
//         statusCode: 400,
//         message: 'Phone number already in use',
//       });
//     }
  
//     // Generate random 8-character password
//     const generatedPassword = Math.random().toString(36).slice(-8);
  
//     // Create and save user
//     const user = new User({
//       name,
//       email,
//       phone,
//       role,
//       password: generatedPassword,
//     });
  
//     await user.save();
  
//     // Send password via email
//     await sendEmail({
//       email: user.email,
//       subject: 'Your Account Has Been Created',
//       templatePath: 'account-created.text',
//       templateData: {
//         firstName: user.name.split(' ')[0],
//         email: user.email,
//         password: generatedPassword,
//         role: user.role,
//       },
//     });
  
//     sendResponse(res, {
//       success: true,
//       statusCode: 201,
//       message: 'User registered successfully.',
//       data: {
//         token: user.generateAuthToken(),
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           phone: user.phone,
//           role: user.role,
//           status: user.status
//         }
//       },
//     });
//   });

export const registerUser = catchAsyncError(async (req, res) => {
  const { name, email, phone, role, password } = req.body;

  // Basic field check
  if (!name || !email) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Please provide name and email',
    });
  }

  // Check if email or phone already used
  if (await User.exists({ email })) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Email is already in use',
    });
  }

  if (phone && (await User.exists({ phone }))) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'Phone number already in use',
    });
  }

  // Use provided password or generate random 8-character password
  const userPassword = password || Math.random().toString(36).slice(-8);

  // Create and save user
  const user = new User({
    name,
    email,
    phone,
    role: role || 'user',
    password: userPassword,
  });

  await user.save();

  // Send password via email
  await sendEmail({
    email: user.email,
    subject: 'Your Account Has Been Created',
    templatePath: 'account-created.text',
    templateData: {
      firstName: user.name.split(' ')[0],
      email: user.email,
      password: userPassword,
      role: user.role,
    },
  });

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User registered successfully.',
    data: {
      token: user.generateAuthToken(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    },
  });
});
// export const login = asyncHandler(async(req,res)=>{
//     const data = req.body;
//     const {email, password}= data;

//     const user =await User.findOne({email:email})
//     if(!user){
//         res.status(401).json({
//             message:"user not found"
//         })
//     }
//     const checkpassword = await bcrypt.compare(password,user.password)
//     if(!checkpassword){
//         res.status(404).json({
//             message:"invalid credential"
//         })
//     }
//     const token = jwt.sign(  {
//                 _id: user._id,
//             },
//             'process.env.JWT_SECRET',
//             {
//                 expiresIn: '7d',
//             },)
//     res.status(201).json({
//         user,
//         token,
//         message:" user login successfully"
//     })
// })

export const loginUser = catchAsyncError(async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email: email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Incorrect email or password. Please try again.',
      });
    }
    if (user.status === 'inactive') {
      return sendResponse(res, {
        success: false,
        statusCode: 403,
        message: 'Your account is inactive. Please contact support.',
      });
    }
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: {
        token: user.generateAuthToken(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status
        }
      },
    });
  });
  
  export const forgotPassword = catchAsyncError(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
  
    const rawToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `https://app.strategemmedia.com/reset-password?token=${rawToken}`;
    // console.log('Reset password URL (with raw token):', resetPasswordUrl);
  
    // const apiResetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${rawToken}`;
    // console.log('API reset URL (with raw token):', apiResetUrl);
  
    // For debugging, also show a URL with the hashed token
    // const hashedResetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${user.resetPasswordToken}`;
    // console.log('API reset URL (with hashed token):', hashedResetUrl);
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        templatePath: 'password-reset.ejs',
        templateData: {
          firstName: user.name.split(' ')[0],
          resetUrl: resetPasswordUrl,
        },
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Reset the token since email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      return sendResponse(res, {
        success: false,
        statusCode: 500,
        message: 'Error sending email. Please try again later.',
      });
    }
  
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Password reset email sent successfully',
    });
  });
  
  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters long',
      };
    }
    return { isValid: true };
  };
  
  export const resetPassword = catchAsyncError(async (req, res) => {
    // Check for token in body, query, or params
    const { password } = req.body;
    const token = req.body.token || req.query.token || req.params.token;
  
    if (!password) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Please provide a new password',
      });
    }
  
    if (!token) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: 'Reset token is required',
      });
    }
  
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: passwordValidation.message,
      });
    }
    let user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');
    if (!user) {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
      // Try to find the user using the hashed token
      user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select('+password');
    }
    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message:
          'Invalid or expired reset token. Please request a new password reset link.',
      });
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        message: 'This is your current password. Please enter a new password',
      });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Password reset successful',
    });
  });
export const logout = asyncHandler(async(req,res)=>{
const user = User.findOneAndDelete(req.params)
res.status(200).json({
    message:"user deleted successfully"
})
})
export const deleteUser = catchAsyncError(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
  
    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }
  
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'User deleted successfully',
      data: user,
    });
  });
  export const getAllUsers = async (req, res) => {
    try {
      // Pagination query params
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const skip = (page - 1) * limit;
  
      // Get total user count
      const totalCount = await User.countDocuments();
  
      // Fetch paginated users
      const users = await User.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
  
      // Clean response structure
      const userDetails = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin || null,
        status: user.status || 'pending',
      }));
  
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Users fetched successfully',
        data: {
          users: userDetails,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      });
    } catch (error) {
      console.error('❌ Error in getAllUsers:', error);
      sendResponse(res, {
        success: false,
        statusCode: 500,
        message: 'Failed to fetch user details',
        error: error.message,
      });
    }
  };
  export const updateProfile = catchAsyncError(async (req, res) => {
    const { name, email } = req.body;
    const updateData = {};
  
    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = req.file.filename;
    } else if (req.body.file) {
      // If uploadImage middleware has processed the file
      updateData.profilePicture = req.body.file.split('/').pop();
    }
  
    // Only update fields that were provided
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return sendResponse(res, {
          success: false,
          statusCode: 400,
          message: 'Email already in use by another account',
        });
      }
      updateData.email = email;
  
      // If email is changed, reset verification status
      updateData.isEmailVerified = false;
      // Generate new verification token
      const user = await User.findById(req.user.id);
      const emailToken = user.generateEmailVerificationToken();
  
      // Save token to updateData
      updateData.emailVerificationToken = user.emailVerificationToken;
      updateData.emailVerificationExpire = user.emailVerificationExpire;
  
      // Send verification email
      await sendEmail({
        email: email,
        subject: 'Email Verification',
        templatePath: 'email-verification.ejs',
        templateData: {
          firstName: name ? name.split(' ')[0] : user.name.split(' ')[0],
          verificationUrl: `https://ocf.workbrink.com/auth/verify-email?token=${emailToken}`,
        },
      });
    }
  
    // Update the user in database
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });
  
    if (!updatedUser) {
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }
  
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: email
        ? 'Profile updated successfully. Please verify your new email.'
        : 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified,
          profilePicture: updatedUser.profilePicture,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  });

  export const getUserDetails = catchAsyncError(async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log('user :', user);
    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }
  
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'User details retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  });