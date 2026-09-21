const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  icon:        { type: String, default: 'fas fa-cog' },
  color:       { type: String, default: '#3b82f6' },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
