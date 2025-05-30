const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('company', 'name company');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a job (employer only)
router.post('/', async (req, res) => {
  try {
    const { title, description, location, salary, type, skillsRequired } = req.body;
    
    // In a real app, you'd verify the user is an employer
    const company = await User.findById(req.user.id);
    if (!company || company.role !== 'employer') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const job = await Job.create({
      title,
      description,
      company: company._id,
      location,
      salary,
      type,
      skillsRequired
    });
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;