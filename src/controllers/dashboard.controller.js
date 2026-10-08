const User = require('../models/User');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
exports.get = asyncHandler(async (_req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0); const end = new Date(start); end.setDate(end.getDate() + 1);
  const [totalCustomers, totalBookings, todayBookings, statusRows, paymentRows, recentBookings, upcomingAppointments] = await Promise.all([
    User.countDocuments({ role: 'customer' }), Booking.countDocuments(), Booking.countDocuments({ preferredDate: { $gte: start, $lt: end } }),
    Booking.aggregate([{ $group: { _id: '$bookingStatus', count: { $sum: 1 } } }]), Booking.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
    Booking.find().populate('user', 'name email phone').sort({ createdAt: -1 }).limit(10), Booking.find({ preferredDate: { $gte: new Date() }, bookingStatus: { $in: ['pending', 'contacted', 'confirmed'] } }).populate('user', 'name email phone').sort({ preferredDate: 1, preferredTime: 1 }).limit(10),
  ]);
  const statuses = Object.fromEntries(statusRows.map((x) => [x._id, x.count])); const payments = Object.fromEntries(paymentRows.map((x) => [x._id, x.count]));
  ok(res, 'Dashboard retrieved', { totalCustomers, totalBookings, todayBookings, pending: statuses.pending || 0, contacted: statuses.contacted || 0, confirmed: statuses.confirmed || 0, completed: statuses.completed || 0, cancelled: statuses.cancelled || 0, paid: payments.paid || 0, unpaid: payments.unpaid || 0, recentBookings, upcomingAppointments });
});
