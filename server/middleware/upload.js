const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage — images go to "dejenie-portfolio" folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isRaw = file.mimetype === 'application/pdf' ||
                  file.originalname.match(/\.(doc|docx)$/i);
    return {
      folder:         'dejenie-portfolio',
      resource_type:  isRaw ? 'raw' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx'],
      transformation: isRaw ? undefined : [{ width: 1200, crop: 'limit', quality: 'auto' }]
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
