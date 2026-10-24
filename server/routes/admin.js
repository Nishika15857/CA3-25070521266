const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/adminController');

router.get('/stats', protect, adminOnly, ctrl.getStats);
router.get('/users', protect, adminOnly, ctrl.getUsers);
router.patch('/users/:id', protect, adminOnly, ctrl.updateUser);
router.get('/items', protect, adminOnly, ctrl.getItems);
router.get('/reports', protect, adminOnly, ctrl.getContentReports);
router.patch('/reports/:id', protect, adminOnly, ctrl.reviewContentReport);
router.get('/contact-messages', protect, adminOnly, ctrl.getContactMessages);
router.patch('/contact-messages/:id', protect, adminOnly, ctrl.updateContactMessage);

module.exports = router;
