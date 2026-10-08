const Website = require('../models/Website');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { publicUploadPath, deleteUpload } = require('../utils/files');

const getOrCreate = () => Website.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { new: true, upsert: true, setDefaultsOnInsert: true });
exports.get = asyncHandler(async (_req, res) => ok(res, 'Website content retrieved', await getOrCreate()));
exports.update = asyncHandler(async (req, res) => {
  const site = await getOrCreate(); const body = { ...req.body };
  ['openingHours', 'socialLinks', 'values', 'facilities', 'timeSlots', 'hero', 'about', 'contact', 'social'].forEach((key) => { if (typeof body[key] === 'string') { try { body[key] = JSON.parse(body[key]); } catch { /* validation occurs through schema */ } } });
  if (body.hero) { body.heroTitle = body.hero.title; body.heroSubtitle = body.hero.subtitle; }
  if (body.about) { body.aboutContent = body.about.story; body.mission = body.about.mission; body.values = body.about.values; body.facilities = body.about.facilities; }
  if (body.contact) Object.assign(body, body.contact); if (body.social) body.socialLinks = body.social; if (body.footerText !== undefined) body.footerContent = body.footerText;
  const allowed = ['spaName', 'logoText', 'tagline', 'heroTitle', 'heroSubtitle', 'aboutContent', 'mission', 'phone', 'email', 'address', 'openingHours', 'socialLinks', 'footerContent', 'currency', 'timeSlots', 'values', 'facilities'];
  allowed.forEach((key) => { if (body[key] !== undefined) site[key] = body[key]; });
  const old = { logo: site.logo, heroImage: site.heroImage };
  for (const file of req.files || []) { if (file.fieldname === 'logo') site.logo = publicUploadPath(file); if (file.fieldname === 'heroImage') site.heroImage = publicUploadPath(file); }
  try { await site.save(); if (site.logo !== old.logo) await deleteUpload(old.logo); if (site.heroImage !== old.heroImage) await deleteUpload(old.heroImage); ok(res, 'Website content updated', site); }
  catch (error) { for (const file of req.files || []) await deleteUpload(publicUploadPath(file)); throw error; }
});
