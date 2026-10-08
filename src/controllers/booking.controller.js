const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Counter = require('../models/Counter');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { pagination, paginationMeta } = require('../utils/query');

async function bookingNumber() {
  const year = new Date().getFullYear(); const counter = await Counter.findByIdAndUpdate(`booking-${year}`, { $inc: { sequence: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return `SPA-${year}-${String(counter.sequence).padStart(5, '0')}`;
}
const populate = (query) => query.populate('user', 'name email phone').populate('services.service', 'name status');
exports.create = asyncHandler(async (req, res) => {
  const ids = [...new Set(req.body.serviceIds)]; const services = await Service.find({ _id: { $in: ids }, status: true });
  if (services.length !== ids.length) throw new ApiError(422, 'One or more selected services are invalid or inactive');
  const guests = Number(req.body.numberOfGuests ?? req.body.guests ?? 1);
  const date = req.body.preferredDate ?? req.body.date; const time = req.body.preferredTime ?? req.body.time;
  if (!date || !time) throw new ApiError(422, 'Date and time are required');
  const snapshots = services.map((s) => ({ service: s._id, name: s.name, price: s.price, duration: s.duration }));
  const booking = await Booking.create({ bookingNumber: await bookingNumber(), user: req.user.id, services: snapshots, preferredDate: date, preferredTime: time, numberOfGuests: guests, totalPrice: snapshots.reduce((sum, s) => sum + s.price, 0) * guests, specialRequest: req.body.specialRequest || '' });
  await booking.populate('user', 'name email phone');
  await booking.populate('services.service', 'name status');
  ok(res, 'Booking created', booking, 201);
});
exports.mine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query); const filter = { user: req.user.id };
  const [items, total] = await Promise.all([populate(Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)), Booking.countDocuments(filter)]);
  ok(res, 'Bookings retrieved', items, 200, paginationMeta(page, limit, total));
});
exports.getMine = asyncHandler(async (req, res) => { const item = await populate(Booking.findOne({ _id: req.params.id, user: req.user.id })); if (!item) throw new ApiError(404, 'Booking not found'); ok(res, 'Booking retrieved', item); });
exports.cancelMine = asyncHandler(async (req, res) => { const item = await populate(Booking.findOneAndUpdate({ _id: req.params.id, user: req.user.id, bookingStatus: 'pending' }, { bookingStatus: 'cancelled' }, { new: true, runValidators: true })); if (!item) throw new ApiError(409, 'Only your pending booking can be cancelled'); ok(res, 'Booking cancelled', item); });
exports.all = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query); const filter = {};
  ['bookingStatus', 'paymentStatus'].forEach((key) => { if (req.query[key]) filter[key] = req.query[key]; });
  if (req.query.from || req.query.to) { filter.preferredDate = {}; if (req.query.from) filter.preferredDate.$gte = new Date(req.query.from); if (req.query.to) filter.preferredDate.$lte = new Date(req.query.to); }
  const [items, total] = await Promise.all([populate(Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)), Booking.countDocuments(filter)]);
  ok(res, 'Bookings retrieved', items, 200, paginationMeta(page, limit, total));
});
exports.getAny = asyncHandler(async (req, res) => { const item = await populate(Booking.findById(req.params.id)); if (!item) throw new ApiError(404, 'Booking not found'); ok(res, 'Booking retrieved', item); });
exports.update = asyncHandler(async (req, res) => {
  const allowed = ['bookingStatus', 'paymentStatus', 'internalNotes']; const patch = {};
  allowed.forEach((key) => { if (req.body[key] !== undefined) patch[key] = req.body[key]; });
  if (req.body.preferredDate ?? req.body.date) patch.preferredDate = req.body.preferredDate ?? req.body.date;
  if (req.body.preferredTime ?? req.body.time) patch.preferredTime = req.body.preferredTime ?? req.body.time;
  const item = await populate(Booking.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true })); if (!item) throw new ApiError(404, 'Booking not found'); ok(res, 'Booking updated', item);
});
exports.remove = asyncHandler(async (req, res) => { const item = await Booking.findByIdAndDelete(req.params.id); if (!item) throw new ApiError(404, 'Booking not found'); ok(res, 'Booking deleted', null); });
