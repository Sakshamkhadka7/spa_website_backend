const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
module.exports = (param = 'id') => (req, _res, next) => mongoose.isValidObjectId(req.params[param]) ? next() : next(new ApiError(400, `Invalid ${param}`));
