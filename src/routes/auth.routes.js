const router = require('express').Router();
const c = require('../controllers/auth.controller'); const { protect } = require('../middleware/auth'); const validate = require('../middleware/validate'); const v = require('../validators').auth;
router.post('/register', v.register, validate, c.register); router.post('/login', v.login, validate, c.login); router.post('/logout', c.logout);
router.get('/me', protect, c.me); router.put('/profile', protect, v.profile, validate, c.updateProfile); router.patch('/change-password', protect, v.password, validate, c.changePassword);
module.exports = router;
