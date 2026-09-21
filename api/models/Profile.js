const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name:         { type: String, default: 'Dejenie Abebe' },
  title:        { type: String, default: 'IT Professional' },
  tagline:      { type: String, default: 'IT PROFESSIONAL · ERP · NETWORKING · CYBERSECURITY' },
  headline:     { type: String, default: 'Building Reliable IT Solutions for Modern Businesses' },
  bio:          { type: String, default: '' },
  about1:       { type: String, default: '' },
  about2:       { type: String, default: '' },
  about3:       { type: String, default: '' },
  location:     { type: String, default: 'Addis Ababa, Ethiopia' },
  email:        { type: String, default: '' },
  phone:        { type: String, default: '' },
  availability: { type: String, default: 'Available for work' },
  linkedin:     { type: String, default: '#' },
  github:       { type: String, default: '#' },
  twitter:      { type: String, default: '#' },
  telegram:     { type: String, default: '#' },
  cvFile:       { type: String, default: '' },
  photo:        { type: String, default: '' },
  stats: {
    experience: { type: String, default: '5' },
    projects:   { type: String, default: '30' },
    clients:    { type: String, default: '20' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
