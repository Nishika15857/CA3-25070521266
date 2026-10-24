const Item = require('../models/Item');
const { uploadToStorage, deleteFromStorage } = require('../middleware/upload');

// GET /api/items  — list with search, filter, pagination
exports.getItems = async (req, res) => {
  try {
    const {
      search, type, category, location, status,
      sortBy = 'createdAt', order = 'desc',
      page = 1, limit = 12,
      dateFrom, dateTo
    } = req.query;

    const filter = { isVisible: true };

    if (type && ['lost', 'found'].includes(type)) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('reporter', 'name')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Item.countDocuments(filter)
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('getItems error:', err);
    res.status(500).json({ success: false, message: 'Could not fetch items.' });
  }
};

// GET /api/items/stats
exports.getStats = async (req, res) => {
  try {
    const [total, lost, found, returned, active] = await Promise.all([
      Item.countDocuments({ isVisible: true }),
      Item.countDocuments({ type: 'lost', isVisible: true }),
      Item.countDocuments({ type: 'found', isVisible: true }),
      Item.countDocuments({ status: 'returned', isVisible: true }),
      Item.countDocuments({ status: 'active', isVisible: true })
    ]);
    res.json({ success: true, stats: { total, lost, found, returned, active } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch stats.' });
  }
};

// GET /api/items/recent
exports.getRecentItems = async (req, res) => {
  try {
    const [recentLost, recentFound, recentReturned] = await Promise.all([
      Item.find({ type: 'lost', isVisible: true, status: 'active' })
        .populate('reporter', 'name')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Item.find({ type: 'found', isVisible: true, status: 'active' })
        .populate('reporter', 'name')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Item.find({ status: 'returned', isVisible: true })
        .populate('reporter', 'name')
        .sort({ updatedAt: -1 })
        .limit(4)
        .lean()
    ]);
    res.json({ success: true, recentLost, recentFound, recentReturned });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch recent items.' });
  }
};

// GET /api/items/:id
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reporter', 'name createdAt');
    if (!item || !item.isVisible) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    // Similar items
    const similar = await Item.find({
      _id: { $ne: item._id },
      category: item.category,
      type: item.type,
      isVisible: true,
      status: 'active'
    }).limit(4).populate('reporter', 'name').lean();

    res.json({ success: true, item, similar });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ success: false, message: 'Item not found.' });
    res.status(500).json({ success: false, message: 'Could not fetch item.' });
  }
};

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    const { title, description, category, type, date, location, additionalInfo, contactMethod, storageInfo } = req.body;

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToStorage(file.path, file.originalname);
          images.push(result);
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr.message);
        }
      }
    }

    const item = await Item.create({
      title, description, category, type,
      date: new Date(date),
      location, additionalInfo, contactMethod, storageInfo,
      images,
      reporter: req.user._id
    });

    await item.populate('reporter', 'name');
    res.status(201).json({ success: true, message: 'Item reported successfully!', item });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(422).json({ success: false, message: messages[0] });
    }
    console.error('createItem error:', err);
    res.status(500).json({ success: false, message: 'Could not create item.' });
  }
};

// PATCH /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const isOwner = item.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const allowed = ['title', 'description', 'category', 'date', 'location', 'additionalInfo', 'contactMethod', 'storageInfo', 'status'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    // Admin can set visibility
    if (isAdmin && req.body.isVisible !== undefined) item.isVisible = req.body.isVisible;
    if (isAdmin && req.body.moderationNote !== undefined) item.moderationNote = req.body.moderationNote;

    await item.save();
    await item.populate('reporter', 'name');
    res.json({ success: true, message: 'Item updated!', item });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(422).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Could not update item.' });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const isOwner = item.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Delete images from storage
    for (const img of item.images) {
      if (img.publicId) await deleteFromStorage(img.publicId);
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not delete item.' });
  }
};

// GET /api/items/user/my-items
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch your items.' });
  }
};
