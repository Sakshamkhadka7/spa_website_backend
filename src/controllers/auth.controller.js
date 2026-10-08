const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { signToken } = require('../services/token.service');

const authPayload = (user) => ({ token: signToken(user), user: user.toJSON() });
exports.register = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({ name: req.body.name, email, phone: req.body.phone, password: req.body.password });
  ok(res, 'Registration successful', authPayload(user), 201);
});
exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !user.isActive || !(await user.comparePassword(req.body.password))) throw new ApiError(401, 'Invalid email or password');
  ok(res, 'Login successful', authPayload(user));
});
exports.logout = (_req, res) => { res.clearCookie('token'); ok(res, 'Logout successful', null); };
exports.me = (req, res) => ok(res, 'Current user retrieved', req.user);
exports.updateProfile = asyncHandler(async (req, res) => {
  ['name', 'phone'].forEach((key) => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
  await req.user.save(); ok(res, 'Profile updated', req.user);
});
exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, 'Current password is incorrect');
  user.password = req.body.newPassword; await user.save(); ok(res, 'Password changed successfully', null);
});
