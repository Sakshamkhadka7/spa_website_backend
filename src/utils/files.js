const fs = require('fs/promises');
const path = require('path');
const uploadsRoot = path.resolve(__dirname, '../../uploads');

exports.publicUploadPath = (file) => file ? `/uploads/${file.destination.split(path.sep).pop()}/${file.filename}` : undefined;
exports.deleteUpload = async (publicPath) => {
  if (!publicPath || !publicPath.startsWith('/uploads/')) return;
  const absolute = path.resolve(uploadsRoot, publicPath.slice('/uploads/'.length));
  if (!absolute.startsWith(`${uploadsRoot}${path.sep}`)) return;
  await fs.unlink(absolute).catch((error) => { if (error.code !== 'ENOENT') throw error; });
};
