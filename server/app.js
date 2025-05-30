const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const applicationsRoutes = require('./routes/applications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON in request bodies

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jobboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Job Board API');
});

// Start server
const PORT = process.env.PORT || 5000;
app.use('/api/applications', applicationsRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});