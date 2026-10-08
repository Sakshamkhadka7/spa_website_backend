const ApiError = require('../utils/ApiError');
const { configureCloudinary } = require('../config/cloudinary');

const allowedFolders = new Set(['spa/services', 'spa/gallery', 'spa/team', 'spa/website']);

function hasValidSignature(file) {
  const buffer = file?.buffer;
  if (!buffer || buffer.length < 12) return false;
  if (file.mimetype === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (file.mimetype === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (file.mimetype === 'image/webp') return buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
  if (file.mimetype === 'image/gif') return ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString());
  return false;
}

function uploadImage(file, folder) {
  if (!file?.buffer) throw new ApiError(422, 'A valid image file is required');
  if (!hasValidSignature(file)) throw new ApiError(415, 'Image content does not match an allowed file type');
  if (!allowedFolders.has(folder)) throw new ApiError(500, 'Invalid image upload destination');

  let client;
  try { client = configureCloudinary(); }
  catch (error) { throw new ApiError(503, error.message); }

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      { folder, resource_type: 'image', use_filename: false, unique_filename: true, overwrite: false },
      (error, result) => {
        if (error || !result?.secure_url || !result?.public_id) {
          return reject(new ApiError(502, 'Image upload failed'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.on('error', () => reject(new ApiError(502, 'Image upload failed')));
    stream.end(file.buffer);
  });
}

async function destroyImage(publicId) {
  if (!publicId || typeof publicId !== 'string' || !publicId.startsWith('spa/')) return false;
  let client;
  try { client = configureCloudinary(); }
  catch { return false; }
  const result = await client.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  return result?.result === 'ok' || result?.result === 'not found';
}

module.exports = { uploadImage, destroyImage, hasValidSignature };
