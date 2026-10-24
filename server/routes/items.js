const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const ctrl = require('../controllers/itemController');

router.get('/', optionalAuth, ctrl.getItems);
router.get('/stats', ctrl.getStats);
router.get('/recent', ctrl.getRecentItems);
router.get('/user/my-items', protect, ctrl.getMyItems);
router.get('/:id', optionalAuth, ctrl.getItem);

router.post('/', protect, upload.array('images', 4), ctrl.createItem);
router.patch('/:id', protect, ctrl.updateItem);
router.delete('/:id', protect, ctrl.deleteItem);

module.exports = router;
