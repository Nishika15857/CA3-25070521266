const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// multer-storage-cloudinary available but we use disk storage + manual upload for reliability

// ─── Cloudinary Config ────────────────────────────────────────────────────────
const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// ─── Local Disk Storage (fallback) ───────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter
});

// ─── Upload to Cloudinary (or serve local) ───────────────────────────────────
const uploadToStorage = async (filePath, originalName) => {
  if (cloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'campusloop/items',
      use_filename: false,
      unique_filename: true,
      resource_type: 'image'
    });
    // Delete local temp file
    fs.unlink(filePath, () => {});
    return { url: result.secure_url, publicId: result.public_id };
  } else {
    // Return local URL
    const filename = path.basename(filePath);
    return {
      url: `/uploads/${filename}`,
      publicId: null
    };
  }
};

const deleteFromStorage = async (publicId) => {
  if (cloudinaryConfigured && publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};

module.exports = { upload, uploadToStorage, deleteFromStorage, cloudinaryConfigured };
