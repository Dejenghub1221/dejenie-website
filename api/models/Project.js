const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  tags:        [{ type: String }],
  image:       { type: String, default: '' },
  imagePublicId: { type: String, default: '' },  // Cloudinary public_id for deletion
  link:        { type: String, default: '#' },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
