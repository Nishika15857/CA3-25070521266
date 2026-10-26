require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(mongoSanitize());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ─── Static Files & Uploads ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Database Connection (with Serverless Caching) ────────────────────────────
const DEFAULT_MONGO_URI = 'mongodb+srv://nishikakalamkar8_db_user:Campus12345@cluster0.zrspaj2.mongodb.net/campusloop?retryWrites=true&w=majority';
const MONGO_URI = process.env.MONGO_URI || DEFAULT_MONGO_URI;

let isConnecting = false;
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (isConnecting) return;
  isConnecting = true;
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  } finally {
    isConnecting = false;
  }
};

// Ensure database is connected before handling any API request
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState < 1) {
    await connectDB();
  }
  next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const itemsRouter = require('./routes/items');
const claimsRouter = require('./routes/claims');
const notificationsRouter = require('./routes/notifications');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const contactRouter = require('./routes/contact');
const matchesRouter = require('./routes/matches');

const routeList = [
  ['health', healthRouter],
  ['auth', authRouter],
  ['items', itemsRouter],
  ['claims', claimsRouter],
  ['notifications', notificationsRouter],
  ['users', usersRouter],
  ['admin', adminRouter],
  ['contact', contactRouter],
  ['matches', matchesRouter]
];

routeList.forEach(([routePath, router]) => {
  app.use(`/api/${routePath}`, router);
  app.use(`/${routePath}`, router);
});

// ─── Serve React Frontend Build ───────────────────────────────────────────────
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ─── 404 for unhandled API requests ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ─── Server Start ─────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  });
}

module.exports = app;
