require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

const DEMO_ITEMS = [
  {
    title: 'Blue Backpack with Laptop',
    description: 'A navy blue Wildcraft backpack with a 15-inch laptop compartment. Has a red keychain on the zipper. Lost near the college library.',
    category: 'Bags & Luggage', type: 'lost',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    location: 'College Library, Ground Floor', status: 'active'
  },
  {
    title: 'Black Wireless Headphones',
    description: 'Sony WH-1000XM4 black headphones found in the computer lab. Has a small sticker on the right ear cup.',
    category: 'Headphones & Earbuds', type: 'found',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    location: 'Computer Lab, Block B', status: 'active'
  },
  {
    title: 'College ID Card',
    description: 'Found an ID card belonging to a student from the CSE department. Laminated card with photo.',
    category: 'ID & Documents', type: 'found',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    location: 'College Canteen', status: 'active'
  },
  {
    title: 'Steel Water Bottle',
    description: 'Silver-colored Milton steel water bottle, 1 litre capacity. Has a dent near the base. Lost during sports period.',
    category: 'Water Bottle', type: 'lost',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    location: 'Sports Ground / Basketball Court', status: 'active'
  },
  {
    title: 'Set of Keys with Keychain',
    description: 'A bunch of 4 keys on a Doraemon keychain. Includes what appears to be house keys and a bike key.',
    category: 'Keys', type: 'found',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    location: 'Main Entrance Gate', status: 'active'
  },
  {
    title: 'Physics Textbook Class 12',
    description: 'NCERT Physics Part 2 for Class 12. Has handwritten notes and is covered with brown paper. Name written inside: Rahul.',
    category: 'Books & Stationery', type: 'lost',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    location: 'Lecture Hall 301', status: 'active'
  },
  {
    title: 'Brown Leather Wallet',
    description: 'Brown leather bi-fold wallet returned with cards inside. Debit cards and some cash found inside. Submitted to admin office.',
    category: 'Wallet & Money', type: 'found',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    location: 'Admin Office Corridor', status: 'returned'
  },
  {
    title: 'Prescription Spectacles',
    description: 'Black rectangular frame spectacles with minus power lenses. Found near the college bus stop.',
    category: 'Spectacles', type: 'found',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    location: 'College Bus Stop', status: 'active'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusloop');
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    await User.deleteMany({ email: { $in: ['admin@campusloop.com', 'demo@campusloop.com', 'student@campusloop.com'] } });

    // Create admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@campusloop.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const admin = await User.create({ name: 'CampusLoop Admin', email: adminEmail, password: adminPassword, role: 'admin' });
    console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}`);

    // Create demo users
    const user1 = await User.create({ name: 'Priya Sharma', email: 'demo@campusloop.com', password: 'Demo@123456', role: 'user' });
    const user2 = await User.create({ name: 'Arjun Mehta', email: 'student@campusloop.com', password: 'Student@123', role: 'user' });
    console.log('✅ Demo users created');

    // Create items
    const reporters = [user1._id, user2._id, admin._id];
    for (let i = 0; i < DEMO_ITEMS.length; i++) {
      const itemData = DEMO_ITEMS[i];
      const reporterId = reporters[i % reporters.length];
      await Item.create({ ...itemData, reporter: reporterId });
    }
    console.log(`✅ ${DEMO_ITEMS.length} demo items created`);

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────────────────────');
    console.log('Admin:   admin@campusloop.com / Admin@123456');
    console.log('User 1:  demo@campusloop.com / Demo@123456');
    console.log('User 2:  student@campusloop.com / Student@123');
    console.log('─────────────────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
