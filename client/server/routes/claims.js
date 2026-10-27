const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/claimController');

router.post('/', protect, [
  body('itemId').notEmpty().withMessage('Item ID required'),
  body('description').isLength({ min: 20, max: 1000 }).withMessage('Please provide a detailed description (min 20 characters)')
], validate, ctrl.submitClaim);

router.get('/my-claims', protect, ctrl.getMyClaims);
router.get('/admin/all', protect, adminOnly, ctrl.getAllClaims);
router.get('/item/:itemId', protect, ctrl.getItemClaims);
router.patch('/:id/review', protect, ctrl.reviewClaim);

module.exports = router;
