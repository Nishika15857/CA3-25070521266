const mongoose = require('mongoose');

const contentReportSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    enum: ['spam', 'fake', 'inappropriate', 'duplicate', 'other'],
  },
  details: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed'],
    default: 'pending'
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

contentReportSchema.index({ item: 1, reportedBy: 1 }, { unique: true });
contentReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContentReport', contentReportSchema);
