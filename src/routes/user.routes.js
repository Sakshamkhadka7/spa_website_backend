const router = require('express').Router(); const c = require('../controllers/user.controller'); const { protect, authorize } = require('../middleware/auth'); const objectId = require('../middleware/objectId');
router.use(protect, authorize('admin')); router.get('/', c.list); router.get('/:id', objectId(), c.get); module.exports = router;
