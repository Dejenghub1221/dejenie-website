const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  percentage: { type: Number, default: 80, min: 1, max: 100 },
  category:   { type: String, default: 'Technical' },
  order:      { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
