const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { pagination, paginationMeta } = require('../utils/query');
const { deleteImageAsset } = require('../utils/files');
const { uploadImage } = require('../services/image.service');

exports.catalogController = (Model, options) => ({
  list: asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const filter = req.user?.role === 'admin' ? {} : { [options.visibilityField]: options.visibleValue };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.$or = options.searchFields.map((f) => ({ [f]: { $regex: req.query.search, $options: 'i' } }));
    const [items, total] = await Promise.all([Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Model.countDocuments(filter)]);
    ok(res, `${options.label} retrieved`, items, 200, paginationMeta(page, limit, total));
  }),
  get: asyncHandler(async (req, res) => {
    const filter = { _id: req.params.id };
    if (req.user?.role !== 'admin') filter[options.visibilityField] = options.visibleValue;
    const item = await Model.findOne(filter); if (!item) throw new ApiError(404, `${options.singular} not found`);
    ok(res, `${options.singular} retrieved`, item);
  }),
  create: asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(422, 'Image is required');
    const uploaded = await uploadImage(req.file, options.cloudinaryFolder);
    const input = options.normalize(req.body); input.image = uploaded.url; input.imagePublicId = uploaded.publicId;
    try { const item = await Model.create(input); ok(res, `${options.singular} created`, item, 201); }
    catch (error) { await deleteImageAsset(input.image, input.imagePublicId); throw error; }
  }),
  update: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id).select('+imagePublicId'); if (!item) throw new ApiError(404, `${options.singular} not found`);
    const oldImage = item.image; const oldPublicId = item.imagePublicId;
    Object.assign(item, options.normalize(req.body));
    let uploaded;
    if (req.file) { uploaded = await uploadImage(req.file, options.cloudinaryFolder); item.image = uploaded.url; item.imagePublicId = uploaded.publicId; }
    try { await item.save(); if (uploaded) await deleteImageAsset(oldImage, oldPublicId); ok(res, `${options.singular} updated`, item); }
    catch (error) { if (uploaded) await deleteImageAsset(uploaded.url, uploaded.publicId); throw error; }
  }),
  remove: asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id).select('+imagePublicId'); if (!item) throw new ApiError(404, `${options.singular} not found`);
    await deleteImageAsset(item.image, item.imagePublicId); ok(res, `${options.singular} deleted`, null);
  }),
});
