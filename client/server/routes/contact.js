const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/contactController');

router.post('/', optionalAuth, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('subject').trim().isLength({ min: 3, max: 200 }).withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be at least 10 characters')
], validate, ctrl.submitContact);

router.post('/report-item/:itemId', protect, [
  body('reason').isIn(['spam', 'fake', 'inappropriate', 'duplicate', 'other']).withMessage('Valid reason required')
], validate, ctrl.reportItem);

module.exports = router;
