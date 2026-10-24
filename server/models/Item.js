const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics', 'Books & Stationery', 'Bags & Luggage',
  'Clothing & Accessories', 'ID & Documents', 'Keys',
  'Wallet & Money', 'Water Bottle', 'Headphones & Earbuds',
  'Spectacles', 'Sports Equipment', 'Jewellery', 'Other'
];

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: CATEGORIES
  },
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['lost', 'found']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  additionalInfo: {
    type: String,
    trim: true,
    maxlength: [500, 'Additional info cannot exceed 500 characters']
  },
  contactMethod: {
    type: String,
    trim: true,
    maxlength: [200, 'Contact method cannot exceed 200 characters']
  },
  storageInfo: {
    type: String,
    trim: true,
    maxlength: [300, 'Storage info cannot exceed 300 characters']
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'claimed', 'returned', 'expired', 'removed'],
    default: 'active'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  moderationNote: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Index for full-text search
itemSchema.index({ title: 'text', description: 'text', location: 'text' });
itemSchema.index({ type: 1, category: 1, status: 1, createdAt: -1 });
itemSchema.index({ reporter: 1, createdAt: -1 });

// Auto-generate slug
itemSchema.pre('save', async function(next) {
  if (this.isModified('title') || this.isNew) {
    const slugify = require('slugify');
    let base = slugify(this.title, { lower: true, strict: true });
    let slug = `${base}-${Date.now()}`;
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
