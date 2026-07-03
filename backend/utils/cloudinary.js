const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Resolve Cloudinary credentials from environment
let cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl?.startsWith('=')) {
  cloudinaryUrl = cloudinaryUrl.slice(1);
}

const isCloudinaryConfigured = !!(
  cloudinaryUrl ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured) {
  try {
    if (cloudinaryUrl) {
      const parts = cloudinaryUrl.split('@');
      const cloudName = parts[1];
      const credentials = parts[0].replace('cloudinary://', '').split(':');
      const apiKey = credentials[0];
      const apiSecret = credentials[1];

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
  } catch (err) {
    console.error('Error configuring Cloudinary:', err.message);
  }
}

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper function to upload file content to Cloudinary
const uploadToCloudOrLocal = async (file) => {
  if (!isCloudinaryConfigured) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error('Cloudinary is not configured. File uploads require CLOUDINARY_URL.');
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'freelance_portal',
    });
    // Delete temporary local file after uploading to Cloudinary
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return {
      url: result.secure_url,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };
  } catch (error) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

module.exports = { upload, uploadToCloudOrLocal };
