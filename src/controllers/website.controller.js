const Website = require('../models/Website');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { deleteImageAsset } = require('../utils/files');
const { uploadImage } = require('../services/image.service');

const getOrCreate = (includeAssetIds = false) => {
  const query = Website.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return includeAssetIds ? query.select('+logoPublicId +heroImagePublicId') : query;
};
exports.get = asyncHandler(async (_req, res) => ok(res, 'Website content retrieved', await getOrCreate()));
exports.update = asyncHandler(async (req, res) => {
  const site = await getOrCreate(true); const body = { ...req.body };
  ['openingHours', 'socialLinks', 'values', 'facilities', 'timeSlots', 'hero', 'about', 'contact', 'social'].forEach((key) => { if (typeof body[key] === 'string') { try { body[key] = JSON.parse(body[key]); } catch { /* validation occurs through schema */ } } });
  if (body.hero) { body.heroTitle = body.hero.title; body.heroSubtitle = body.hero.subtitle; }
  if (body.about) { body.aboutContent = body.about.story; body.mission = body.about.mission; body.values = body.about.values; body.facilities = body.about.facilities; }
  if (body.contact) Object.assign(body, body.contact); if (body.social) body.socialLinks = body.social; if (body.footerText !== undefined) body.footerContent = body.footerText;
  const allowed = ['spaName', 'logoText', 'tagline', 'heroTitle', 'heroSubtitle', 'aboutContent', 'mission', 'phone', 'email', 'address', 'openingHours', 'socialLinks', 'footerContent', 'currency', 'timeSlots', 'values', 'facilities'];
  allowed.forEach((key) => { if (body[key] !== undefined) site[key] = body[key]; });
  const old = { logo: site.logo, logoPublicId: site.logoPublicId, heroImage: site.heroImage, heroImagePublicId: site.heroImagePublicId };
  const uploaded = [];
  try {
    for (const file of req.files || []) {
      const image = await uploadImage(file, 'spa/website'); uploaded.push(image);
      if (file.fieldname === 'logo') { site.logo = image.url; site.logoPublicId = image.publicId; }
      if (file.fieldname === 'heroImage') { site.heroImage = image.url; site.heroImagePublicId = image.publicId; }
    }
    await site.save();
    if (site.logo !== old.logo) await deleteImageAsset(old.logo, old.logoPublicId);
    if (site.heroImage !== old.heroImage) await deleteImageAsset(old.heroImage, old.heroImagePublicId);
    ok(res, 'Website content updated', site);
  } catch (error) { await Promise.allSettled(uploaded.map((image) => deleteImageAsset(image.url, image.publicId))); throw error; }
});
