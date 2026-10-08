const { v2: cloudinary } = require('cloudinary');

let configured = false;

function configureCloudinary() {
  if (configured) return cloudinary;

  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required Cloudinary configuration: ${missing.join(', ')}`);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return cloudinary;
}

module.exports = { cloudinary, configureCloudinary };
