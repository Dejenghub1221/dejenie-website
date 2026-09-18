const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  issuer:   { type: String, default: '' },
  year:     { type: String, default: '' },
  category: { type: String, default: '' },
  icon:     { type: String, default: 'fas fa-certificate' },
  color:    { type: String, default: '#3b82f6' },
  order:    { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Certification', certificationSchema);
