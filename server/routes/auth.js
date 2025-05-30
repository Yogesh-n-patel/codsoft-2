const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs'); // <-- ADD THIS


// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, company } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      role,
      name,
      company: role === 'employer' ? company : undefined
    });
    
    // Create token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', {
      expiresIn: '1d'
    });
    
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', {
      expiresIn: '1d'
    });
    
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;