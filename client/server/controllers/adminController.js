const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const ContentReport = require('../models/ContentReport');
const ContactMessage = require('../models/ContactMessage');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalItems, totalClaims, totalReturned,
      lostItems, foundItems, pendingClaims,
      newUsers30d, newItems30d,
      categoryStats, contentReports, contactMessages
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ isVisible: true }),
      Claim.countDocuments(),
      Item.countDocuments({ status: 'returned' }),
      Item.countDocuments({ type: 'lost', isVisible: true }),
      Item.countDocuments({ type: 'found', isVisible: true }),
      Claim.countDocuments({ status: 'pending' }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Item.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isVisible: true }),
      Item.aggregate([
        { $match: { isVisible: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ContentReport.countDocuments({ status: 'pending' }),
      ContactMessage.countDocuments({ status: 'new' })
    ]);

    // Items over last 30 days (daily)
    const dailyItems = await Item.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, isVisible: true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          lost: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalItems, totalClaims, totalReturned,
        lostItems, foundItems, pendingClaims,
        newUsers30d, newItems30d,
        categoryStats,
        contentReports, contactMessages,
        dailyItems
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch stats.' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(filter)
    ]);

    res.json({ success: true, users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch users.' });
  }
};

// PATCH /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot modify your own admin role.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role !== undefined && { role }), ...(isActive !== undefined && { isActive }) },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update user.' });
  }
};

// GET /api/admin/items
exports.getItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, status, isVisible } = req.query;
    const filter = {};
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }];
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (isVisible !== undefined) filter.isVisible = isVisible === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Item.find(filter).populate('reporter', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Item.countDocuments(filter)
    ]);

    res.json({ success: true, items, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch items.' });
  }
};

// GET /api/admin/reports
exports.getContentReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      ContentReport.find(filter)
        .populate('item', 'title type')
        .populate('reportedBy', 'name email')
        .populate('moderator', 'name')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      ContentReport.countDocuments(filter)
    ]);

    res.json({ success: true, reports, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch reports.' });
  }
};

// PATCH /api/admin/reports/:id
exports.reviewContentReport = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await ContentReport.findByIdAndUpdate(
      req.params.id,
      { status, moderator: req.user._id },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    // If dismissed but item should be hidden
    if (status === 'reviewed' && req.body.hideItem) {
      await Item.findByIdAndUpdate(report.item, { isVisible: false, moderationNote: 'Hidden by admin following content report.' });
    }

    res.json({ success: true, message: 'Report updated!', report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update report.' });
  }
};

// GET /api/admin/contact-messages
exports.getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      ContactMessage.countDocuments(filter)
    ]);

    res.json({ success: true, messages, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch messages.' });
  }
};

// PATCH /api/admin/contact-messages/:id
exports.updateContactMessage = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Status updated!', data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not update message.' });
  }
};
