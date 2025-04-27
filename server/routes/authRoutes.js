// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure you have a User model
const { generateOTP, sendOTPEmail } = require('../utils/otp');
const crypto = require('crypto');
const sendEmail = require('../utils/email'); // Assuming you have a utility for sending emails

// const frontendUrl = 'http://localhost:5173';
const frontendUrl = 'https://invoice-frontend-mfaz.onrender.com';

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request body:', req.body);

    const { email, password, role } = req.body;
    const userId = req.body.userId; // Optional for admin

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // For user role, userId is required
    if (role === 'user' && !userId) {
      return res.status(400).json({ message: 'User ID is required for user role' });
    }

    // Check if user already exists
    const query = { email };
    if (role === 'user') {
      query.$or = [{ email }, { userId }];
    }
    
    let user = await User.findOne(query);
    if (user) {
      return res.status(400).json({ 
        message: user.email === email 
          ? 'User already exists with this email' 
          : 'User ID already taken'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create user
    const newUser = {
      email,
      password,
      role,
      otp,
      otpExpires,
      ...(role === 'user' && { userId }) // Only include userId for user role
    };

    user = new User(newUser);
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({ 
      message: 'OTP sent to your email', 
      email,
      ...(role === 'user' && { userId }) // Only return userId for user role
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email,
      otpExpires: { $gt: Date.now() } 
    });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        userId: user.userId,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: {
            id: user.id,
            userId: user.userId,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log('Login attempt for:', trimmedEmail);
    
    // Find user with password explicitly selected
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') } 
    }).select('+password');
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.email);
    console.log('Verification status:', user.isVerified);
    
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    
    // Password comparison
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    
    if (!isMatch) {
      console.log('Password comparison failed');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password match successful');
    
    // Create JWT payload (exclude sensitive data)
    const payload = {
      user: {
        id: user._id,
        userId: user.userId,
        role: user.role
      }
    };

    // Generate token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }
        
        // Return token and safe user data
        res.json({ 
          token,
          user: {
            id: user._id,
            userId: user.userId,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Token Validation Route
router.get('/validate', (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// 1. Request Password Reset
// 1. Request Password Reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email input
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email });

    // Return same success message whether user exists or not (security best practice)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`); // Log for admin
      return res.json({ message: 'If an account exists, a password reset email has been sent' });
    }

    // Generate and save reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiry
    
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset for your account.</p>
          <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Roll back the token if email fails
      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();
      throw new Error('Failed to send password reset email');
    }

    res.json({ 
      success: true,
      message: 'If an account exists, a password reset email has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 2. Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('Reset password request for token:', token); // Debug log

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired token:', token); // Debug log
      return res.status(400).json({ 
        message: 'Invalid or expired token. Please request a new password reset.' 
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    
    await user.save();

    console.log('Password reset successful for user:', user.email); // Debug log
    
    res.json({ 
      success: true,
      message: 'Password updated successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add to authRoutes.js
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ valid: false });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ message: 'Error validating token' });
  }
});

// Add this to your backend routes
router.get('/check-userid/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: 'Error checking user ID' });
  }
});

module.exports = router;