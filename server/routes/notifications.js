const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.get('/', protect, ctrl.getNotifications);
router.get('/unread-count', protect, ctrl.getUnreadCount);
router.patch('/read-all', protect, ctrl.markAllAsRead);
router.patch('/:id/read', protect, ctrl.markAsRead);

module.exports = router;
