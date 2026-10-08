const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

const mimeExtensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
function uploader(_folder) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: (Number(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024, files: 20 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!mimeExtensions[file.mimetype] || !Object.values(mimeExtensions).includes(ext === '.jpeg' ? '.jpg' : ext)) return cb(new ApiError(415, 'Only JPG, PNG, WEBP, and GIF images are allowed'));
      cb(null, true);
    },
  });
}
exports.uploadFor = uploader;
