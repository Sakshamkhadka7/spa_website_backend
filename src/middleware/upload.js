const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

const mimeExtensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const root = path.resolve(__dirname, '../../uploads');
function uploader(folder) {
  const destination = path.join(root, folder);
  fs.mkdirSync(destination, { recursive: true });
  return multer({
    storage: multer.diskStorage({ destination: (_req, _file, cb) => cb(null, destination), filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${mimeExtensions[file.mimetype]}`) }),
    limits: { fileSize: (Number(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024, files: 20 },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!mimeExtensions[file.mimetype] || !Object.values(mimeExtensions).includes(ext === '.jpeg' ? '.jpg' : ext)) return cb(new ApiError(415, 'Only JPG, PNG, WEBP, and GIF images are allowed'));
      cb(null, true);
    },
  });
}
exports.uploadFor = uploader;
