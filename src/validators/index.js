const { body } = require('express-validator');
const bool = (field) => body(field).optional().isBoolean().withMessage(`${field} must be boolean`).toBoolean();
exports.auth = {
  register: [body('name').trim().isLength({ min: 2, max: 80 }), body('email').trim().isEmail().normalizeEmail(), body('phone').trim().isLength({ min: 7, max: 20 }), body('password').isLength({ min: 8, max: 100 })],
  login: [body('email').trim().isEmail().normalizeEmail(), body('password').notEmpty()],
  profile: [body('name').optional().trim().isLength({ min: 2, max: 80 }), body('phone').optional().trim().isLength({ min: 7, max: 20 })],
  password: [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8, max: 100 })],
};
exports.service = [body('name').trim().isLength({ min: 2, max: 80 }), body('category').trim().isLength({ min: 2, max: 40 }), body('description').trim().isLength({ min: 10, max: 1000 }), body('duration').isInt({ min: 10, max: 600 }).toInt(), body('price').isFloat({ min: 0 }).toFloat(), bool('status'), bool('active')];
exports.team = [body('name').trim().isLength({ min: 2, max: 80 }), body('position').trim().isLength({ min: 2, max: 60 }), body('specialization').trim().isLength({ min: 2, max: 100 }), body('experience').isInt({ min: 0, max: 80 }).toInt(), body('bio').trim().isLength({ min: 10, max: 1000 }), bool('status')];
exports.gallery = [body('title').optional().trim().isLength({ max: 120 }), body('caption').optional().trim().isLength({ max: 300 }), body('category').trim().isLength({ min: 2, max: 40 }), bool('isVisible'), bool('visible')];
exports.booking = [body('serviceIds').isArray({ min: 1, max: 20 }), body('serviceIds.*').isMongoId(), body('preferredDate').optional().isISO8601(), body('date').optional().isISO8601(), body('preferredTime').optional().trim().notEmpty(), body('time').optional().trim().notEmpty(), body('numberOfGuests').optional().isInt({ min: 1, max: 20 }).toInt(), body('guests').optional().isInt({ min: 1, max: 20 }).toInt(), body('specialRequest').optional().trim().isLength({ max: 1000 })];
