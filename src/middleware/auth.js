const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../services/token.service');

exports.protect = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) throw new ApiError(401, 'Authentication required');
  let payload;
  try { payload = verifyToken(token); } catch { throw new ApiError(401, 'Invalid or expired token'); }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'User is unavailable');
  req.user = user;
  next();
});

exports.authorize = (...roles) => (req, _res, next) => roles.includes(req.user?.role) ? next() : next(new ApiError(403, 'You are not authorized to perform this action'));
