const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// GET /api/users/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [myItems, myClaims] = await Promise.all([
      Item.find({ reporter: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      Claim.find({ claimant: req.user._id })
        .populate('item', 'title type category images status location date')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const stats = {
      totalReports: await Item.countDocuments({ reporter: req.user._id }),
      lostReports: await Item.countDocuments({ reporter: req.user._id, type: 'lost' }),
      foundReports: await Item.countDocuments({ reporter: req.user._id, type: 'found' }),
      totalClaims: await Claim.countDocuments({ claimant: req.user._id }),
      pendingClaims: await Claim.countDocuments({ claimant: req.user._id, status: 'pending' }),
      approvedClaims: await Claim.countDocuments({ claimant: req.user._id, status: 'approved' })
    };

    res.json({ success: true, stats, myItems, myClaims });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch dashboard.' });
  }
});

module.exports = router;
