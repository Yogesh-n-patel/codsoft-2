const express = require('express');
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF, DOC, and DOCX files are allowed!');
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply for a job
router.post('/:jobId', upload.single('resume'), async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Validate job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Validate user is a candidate
    const user = await User.findById(userId);
    if (user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply for jobs' });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: userId,
      coverLetter,
      resume: req.file ? req.file.path : null,
      status: 'submitted'
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;