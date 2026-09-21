const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  url:           { type: String, required: true },
  imagePublicId: { type: String, default: '' },  // Cloudinary public_id
  caption:       { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
