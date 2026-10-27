const ContactMessage = require('../models/ContactMessage');
const ContentReport = require('../models/ContentReport');

// POST /api/contact
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const msg = await ContactMessage.create({
      name, email, subject, message,
      userId: req.user ? req.user._id : null
    });
    res.status(201).json({ success: true, message: 'Message sent successfully! We will get back to you soon.', data: msg });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(422).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Could not send message.' });
  }
};

// POST /api/contact/report-item/:itemId
exports.reportItem = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const existing = await ContentReport.findOne({ item: req.params.itemId, reportedBy: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reported this item.' });
    }
    const report = await ContentReport.create({
      item: req.params.itemId,
      reportedBy: req.user._id,
      reason, details
    });
    res.status(201).json({ success: true, message: 'Item reported. Our team will review it.', report });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reported this item.' });
    }
    res.status(500).json({ success: false, message: 'Could not submit report.' });
  }
};
