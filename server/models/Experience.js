const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  period:      { type: String, required: true },
  description: { type: String, default: '' },
  tags:        [{ type: String }],
  order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
