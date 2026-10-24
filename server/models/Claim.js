const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Claim description is required'],
    trim: true,
    minlength: [20, 'Please provide a detailed claim description (min 20 chars)'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  verificationDetails: {
    type: String,
    trim: true,
    maxlength: [1000, 'Verification details cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'returned'],
    default: 'pending'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Review notes cannot exceed 500 characters']
  },
  additionalInfoRequested: {
    type: String,
    trim: true,
    maxlength: [500, 'Additional info request cannot exceed 500 characters']
  },
  returnedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Compound index to prevent duplicate active claims
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });
claimSchema.index({ claimant: 1, status: 1 });
claimSchema.index({ item: 1, status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
