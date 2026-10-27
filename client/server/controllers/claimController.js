const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, relatedItem, relatedClaim }) => {
  try {
    await Notification.create({ recipient, type, title, message, relatedItem, relatedClaim });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

// POST /api/claims  — Submit claim
exports.submitClaim = async (req, res) => {
  try {
    const { itemId, description, verificationDetails } = req.body;

    const item = await Item.findById(itemId).populate('reporter', 'name _id');
    if (!item || !item.isVisible) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    if (item.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This item is no longer available for claims.' });
    }
    if (item.reporter._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own listing.' });
    }

    // Check for duplicate claim
    const existingClaim = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existingClaim) {
      return res.status(409).json({ success: false, message: 'You have already submitted a claim for this item.' });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      description,
      verificationDetails
    });

    // Notify item reporter
    await createNotification({
      recipient: item.reporter._id,
      type: 'claim_submitted',
      title: 'New Claim Received',
      message: `Someone has submitted a claim for your item: "${item.title}". Please review it in your dashboard.`,
      relatedItem: item._id,
      relatedClaim: claim._id
    });

    await claim.populate([{ path: 'item', select: 'title type' }, { path: 'claimant', select: 'name' }]);
    res.status(201).json({ success: true, message: 'Claim submitted successfully!', claim });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already submitted a claim for this item.' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(422).json({ success: false, message: messages[0] });
    }
    console.error('submitClaim error:', err);
    res.status(500).json({ success: false, message: 'Could not submit claim.' });
  }
};

// GET /api/claims/my-claims
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title type category images status location date')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch claims.' });
  }
};

// GET /api/claims/item/:itemId  — Claims on my item
exports.getItemClaims = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const isOwner = item.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'name email createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch claims.' });
  }
};

// PATCH /api/claims/:id/review  — Admin/Owner review claim
exports.reviewClaim = async (req, res) => {
  try {
    const { status, reviewNotes, additionalInfoRequested } = req.body;

    const claim = await Claim.findById(req.params.id)
      .populate('item', 'title reporter _id type')
      .populate('claimant', 'name _id');

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });

    const item = await Item.findById(claim.item._id);
    const isOwner = item.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this claim.' });
    }

    const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected', 'returned'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    claim.status = status;
    claim.reviewer = req.user._id;
    if (reviewNotes) claim.reviewNotes = reviewNotes;
    if (additionalInfoRequested) claim.additionalInfoRequested = additionalInfoRequested;
    if (status === 'returned') {
      claim.returnedAt = new Date();
      item.status = 'returned';
      await item.save();
    }
    await claim.save();

    // Notify claimant
    const notifMap = {
      approved: { type: 'claim_approved', title: 'Claim Approved!', message: `Your claim for "${claim.item.title}" has been approved. Please coordinate pickup.` },
      rejected: { type: 'claim_rejected', title: 'Claim Update', message: `Your claim for "${claim.item.title}" was not approved. Reason: ${reviewNotes || 'See details.'}` },
      under_review: { type: 'claim_under_review', title: 'Claim Under Review', message: `Your claim for "${claim.item.title}" is now under review.` },
      returned: { type: 'item_returned', title: 'Item Returned!', message: `Great news! "${claim.item.title}" has been marked as returned successfully.` },
      pending: { type: 'additional_info_requested', title: 'Additional Info Needed', message: additionalInfoRequested || `More info needed for your claim on "${claim.item.title}".` }
    };

    if (notifMap[status]) {
      await createNotification({
        recipient: claim.claimant._id,
        ...notifMap[status],
        relatedItem: claim.item._id,
        relatedClaim: claim._id
      });
    }

    res.json({ success: true, message: 'Claim updated!', claim });
  } catch (err) {
    console.error('reviewClaim error:', err);
    res.status(500).json({ success: false, message: 'Could not update claim.' });
  }
};

// GET /api/claims/admin/all  — Admin: all claims
exports.getAllClaims = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('item', 'title type category')
        .populate('claimant', 'name email')
        .populate('reviewer', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Claim.countDocuments(filter)
    ]);

    res.json({ success: true, claims, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch claims.' });
  }
};
