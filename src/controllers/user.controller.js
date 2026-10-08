const User = require('../models/User');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { pagination, paginationMeta } = require('../utils/query');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query); const filter = { role: 'customer' };
  if (req.query.search) filter.$or = ['name', 'email', 'phone'].map((key) => ({ [key]: { $regex: req.query.search, $options: 'i' } }));
  const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), User.countDocuments(filter)]);
  const ids = users.map((u) => u._id); const stats = await Booking.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: '$user', totalBookings: { $sum: 1 }, lastBooking: { $max: '$createdAt' }, totalSpent: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0] } } } }]);
  const map = new Map(stats.map((s) => [s._id.toString(), s]));
  const data = users.map((u) => ({ id: u._id.toString(), name: u.name, email: u.email, phone: u.phone, role: u.role, isActive: u.isActive, createdAt: u.createdAt, bookingCount: map.get(u._id.toString())?.totalBookings || 0, totalBookings: map.get(u._id.toString())?.totalBookings || 0, totalSpent: map.get(u._id.toString())?.totalSpent || 0, lastBooking: map.get(u._id.toString())?.lastBooking || null }));
  ok(res, 'Customers retrieved', data, 200, paginationMeta(page, limit, total));
});
exports.get = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'customer' }); if (!user) throw new ApiError(404, 'Customer not found');
  const bookings = await Booking.find({ user: user.id }).sort({ createdAt: -1 }); ok(res, 'Customer retrieved', { customer: user, bookings, totalBookings: bookings.length, lastBooking: bookings[0] || null });
});
