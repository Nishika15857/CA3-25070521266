const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/matchController');

router.get('/:itemId', protect, ctrl.getMatches);

module.exports = router;
