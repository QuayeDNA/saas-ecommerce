# API Implementation Guide

This document provides guidance on implementing a Node.js/Express backend compatible with the frontend authentication flow.

## Authentication Endpoints

The frontend is designed to work with the following REST API endpoints:

### User Authentication

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/auth/login` | POST | Authenticate user | `{ email, password, rememberMe }` | `{ user: User, token: string }` |
| `/api/auth/register` | POST | Register new user | `{ fullName, email, phone, password, userType }` | `{ message: string }` |
| `/api/auth/forgot-password` | POST | Request password reset | `{ email }` | `{ message: string }` |
| `/api/auth/reset-password` | POST | Reset password | `{ token, password }` | `{ message: string }` |
| `/api/auth/verify-account` | POST | Verify account | `{ token }` | `{ message: string }` |
| `/api/auth/verify-token` | POST | Verify JWT token | Authentication header | `{ valid: boolean }` |
| `/api/auth/logout` | POST | Logout user | Authentication header | `{ message: string }` |

## Sample Express Implementation

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// Sample user model and authentication middleware
const User = require('../models/user');
const auth = require('../middleware/auth');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, userType } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      userType,
      walletBalance: 0
    });
    
    await user.save();
    
    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // In a real app, send verification email
    // sendVerificationEmail(user.email, verificationToken);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add other endpoints (forgot-password, reset-password, verify-account, etc.)

module.exports = router;
```

## Security Considerations

1. **JWT Secret**: Use a strong, environment-specific secret for JWT signing
2. **Password Storage**: Always hash passwords using bcrypt or similar
3. **HTTPS**: Ensure all API endpoints are served over HTTPS
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Validation**: Validate all input data before processing
6. **CORS**: Configure proper CORS rules for your API
7. **Token Management**: Implement token refresh mechanism for extended sessions

## Environment Variables

Configure the following environment variables for your backend:

```env
JWT_SECRET=your_jwt_secret_key
DB_URI=your_database_connection_string
EMAIL_SERVICE=your_email_service_provider
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password
FRONTEND_URL=your_frontend_url
```
