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

exports.deleteImageAsset = async (publicPath, publicId) => {
  try {
    if (publicId) {
      const Service = require('../models/Service');
      const Gallery = require('../models/Gallery');
      const TeamMember = require('../models/TeamMember');
      const Website = require('../models/Website');
      const references = await Promise.all([
        Service.exists({ imagePublicId: publicId }).then(Boolean),
        Gallery.exists({ imagePublicId: publicId }).then(Boolean),
        TeamMember.exists({ imagePublicId: publicId }).then(Boolean),
        Website.exists({ $or: [{ logoPublicId: publicId }, { heroImagePublicId: publicId }] }).then(Boolean),
      ]);
      if (references.some(Boolean)) return false;
      return await require('../services/image.service').destroyImage(publicId);
    }
    await exports.deleteUpload(publicPath);
    return true;
  } catch {
    // Asset cleanup must not invalidate an already committed database mutation.
    return false;
  }
};
