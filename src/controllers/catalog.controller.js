const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { pagination, paginationMeta } = require('../utils/query');
const { publicUploadPath, deleteUpload } = require('../utils/files');

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
    const input = options.normalize(req.body); input.image = publicUploadPath(req.file);
    try { const item = await Model.create(input); ok(res, `${options.singular} created`, item, 201); }
    catch (error) { await deleteUpload(input.image); throw error; }
  }),
  update: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id); if (!item) throw new ApiError(404, `${options.singular} not found`);
    const oldImage = item.image; Object.assign(item, options.normalize(req.body)); if (req.file) item.image = publicUploadPath(req.file);
    try { await item.save(); if (req.file) await deleteUpload(oldImage); ok(res, `${options.singular} updated`, item); }
    catch (error) { if (req.file) await deleteUpload(item.image); throw error; }
  }),
  remove: asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id); if (!item) throw new ApiError(404, `${options.singular} not found`);
    await deleteUpload(item.image); ok(res, `${options.singular} deleted`, null);
  }),
});
