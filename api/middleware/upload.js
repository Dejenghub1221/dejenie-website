const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey    = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured =
  cloudName && apiKey && apiSecret &&
  !cloudName.includes('your_cloud_name') &&
  !apiKey.includes('your_api_key');

let storage;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key:    apiKey,
    api_secret: apiSecret
  });

  storage = new CloudinaryStorage({
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
} else {
  // Local storage fallback
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
      cb(null, `${file.fieldname}-${unique}${ext}`);
    }
  });
}

const multerUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware wrapper ensuring req.file.path is a web-accessible URL when local storage is used
const upload = {
  single: (fieldName) => (req, res, next) => {
    multerUpload.single(fieldName)(req, res, (err) => {
      if (err) return next(err);
      if (req.file && !isCloudinaryConfigured) {
        // Expose path as relative URL
        req.file.path = `/uploads/${req.file.filename}`;
      }
      next();
    });
  }
};

module.exports = upload;
