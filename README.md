# 🔁 CampusLoop — Smart Campus Lost & Found Portal

<div align="center">

![STATUS](https://img.shields.io/badge/STATUS-COMPLETED-brightgreen?style=for-the-badge)
![STACK](https://img.shields.io/badge/STACK-MERN-blue?style=for-the-badge)
![FRONTEND](https://img.shields.io/badge/FRONTEND-React.js-61DAFB?style=for-the-badge&logo=react)
![BACKEND](https://img.shields.io/badge/BACKEND-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)
![DATABASE](https://img.shields.io/badge/DATABASE-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)
![DEPLOY](https://img.shields.io/badge/DEPLOY-Vercel%20%2B%20Render-black?style=for-the-badge)
![LIVE DEMO](https://img.shields.io/badge/LIVE%20DEMO-Pending%20Deployment-orange?style=for-the-badge)

**Lost Something? Let's Bring It Back.**

A complete full-stack MERN web application for reporting, searching and recovering lost & found items on a campus or in any institutional environment.

</div>

---

## 📸 Screenshots

> _Screenshots will be added after the live deployment is complete._

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 Report Lost Items | Submit detailed lost-item reports with photos, category, location and date |
| 🟢 Report Found Items | Report found items safely without exposing sensitive identifying details |
| 🔍 Smart Search & Filters | Search by keyword, filter by category, type, location, date range and status |
| 🔗 Smart Matching Algorithm | Rule-based scoring system finds potential matches between lost and found items |
| ✋ Claim & Recovery System | Submit claims, review them, approve/reject with notifications |
| 🔔 In-App Notifications | Real-time in-app notifications for claim updates, matches and recovery |
| 📊 User Dashboard | Personal overview of reports, claims, activity and notifications |
| 🛡️ Admin Dashboard | Full moderation — users, items, claims, content reports, charts |
| 📈 Live Statistics | Real database-driven stats on the homepage and admin panel |
| 📷 Image Upload | Cloudinary cloud storage (or local fallback for development) |
| 🔒 JWT Authentication | Secure login and registration with bcrypt password hashing |
| 🛡️ Role-Based Access | User and Admin roles with protected server-side endpoints |
| 📱 Fully Responsive | Works on desktop, tablet and mobile |
| 📬 Contact Form | Messages saved to MongoDB and reviewable by admins |
| 🚩 Content Reporting | Report suspicious or inappropriate listings |

---

## 🏗️ Technology Stack

**Frontend**
- React.js 18
- React Router DOM v6
- Axios (API client)
- Recharts (charts)
- React Hot Toast (notifications)
- Custom CSS with CSS Variables

**Backend**
- Node.js + Express.js
- Mongoose + MongoDB Atlas
- JWT Authentication
- bcryptjs (password hashing)
- Multer (file upload)
- Cloudinary (image storage)
- Helmet, express-mongo-sanitize, express-rate-limit (security)
- express-validator (input validation)

---

## 📁 Project Structure

```
CampusLoop/
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/         # Reusable components
│       │   ├── Navbar.js/css
│       │   ├── Footer.js/css
│       │   ├── ItemCard.js/css
│       │   └── LoadingPage.js
│       ├── context/
│       │   └── AuthContext.js  # JWT auth context
│       ├── pages/              # All page components
│       │   ├── Home.js/css
│       │   ├── Browse.js/css
│       │   ├── ItemDetails.js/css
│       │   ├── ReportLost.js
│       │   ├── ReportFound.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js/css
│       │   ├── AdminDashboard.js/css
│       │   ├── Profile.js
│       │   ├── About.js
│       │   ├── Contact.js
│       │   ├── Safety.js
│       │   └── NotFound.js
│       ├── services/
│       │   ├── api.js          # Axios instance + interceptors
│       │   └── services.js     # All API service functions
│       ├── styles/
│       │   └── globals.css     # Global design system
│       ├── App.js
│       └── index.js
│
├── server/                     # Express backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itemController.js
│   │   ├── claimController.js
│   │   ├── notificationController.js
│   │   ├── matchController.js
│   │   ├── adminController.js
│   │   └── contactController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect, adminOnly
│   │   ├── upload.js           # Multer + Cloudinary
│   │   └── validate.js         # express-validator helper
│   ├── models/
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Claim.js
│   │   ├── Notification.js
│   │   ├── ContentReport.js
│   │   └── ContactMessage.js
│   ├── routes/
│   │   ├── health.js
│   │   ├── auth.js
│   │   ├── items.js
│   │   ├── claims.js
│   │   ├── notifications.js
│   │   ├── matches.js
│   │   ├── users.js
│   │   ├── admin.js
│   │   └── contact.js
│   ├── utils/
│   │   └── seed.js             # Demo data seed script
│   ├── index.js                # Express app entry point
│   ├── package.json
│   ├── .env                    # (git-ignored)
│   └── .env.example
│
├── .gitignore
├── package.json                # Root scripts
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CampusLoop.git
cd CampusLoop
```

### 2. Configure Backend

```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
```

**server/.env values:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusloop
JWT_SECRET=your_long_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...  # optional
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Configure Frontend

```bash
cd ../client
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
npm install
```

### 4. Seed Demo Data

```bash
cd ../server
npm run seed
```

This creates:
- **Admin:** `admin@campusloop.com` / `Admin@123456`
- **User 1:** `demo@campusloop.com` / `Demo@123456`
- **User 2:** `student@campusloop.com` / `Student@123`
- 8 demo items

### 5. Run Both Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server: http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
# Frontend: http://localhost:3000
```

### Health Check
```
GET http://localhost:5000/api/health
```

---

## 🗄️ Database Design

### MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | User accounts, roles, preferences |
| `items` | Lost and found item listings |
| `claims` | Ownership claims with verification details |
| `notifications` | In-app notifications per user |
| `contentreports` | Suspicious listing reports |
| `contactmessages` | Contact form submissions |

### Key Relationships

```
User  ─── (reporter) ───▶  Item
User  ─── (claimant) ───▶  Claim  ◀─── (item) ─── Item
User  ◀─── (recipient) ─── Notification ─── (relatedItem) ──▶ Item
```

### Indexes
- `items`: text index on title+description+location; compound index on type+category+status
- `claims`: unique compound on item+claimant (prevents duplicate claims)
- `notifications`: recipient+isRead+createdAt

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | User | Get current user |
| PATCH | `/api/auth/update-profile` | User | Update name |
| PATCH | `/api/auth/change-password` | User | Change password |

### Items
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/items` | Public | List with filters & pagination |
| GET | `/api/items/stats` | Public | Homepage statistics |
| GET | `/api/items/recent` | Public | Recently reported items |
| GET | `/api/items/user/my-items` | User | My reports |
| GET | `/api/items/:id` | Public | Item details + similar |
| POST | `/api/items` | User | Create item (multipart) |
| PATCH | `/api/items/:id` | Owner/Admin | Update item |
| DELETE | `/api/items/:id` | Owner/Admin | Delete item |

### Claims
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/claims` | User | Submit claim |
| GET | `/api/claims/my-claims` | User | My claims |
| GET | `/api/claims/item/:itemId` | Owner/Admin | Claims on item |
| PATCH | `/api/claims/:id/review` | Owner/Admin | Review claim |
| GET | `/api/claims/admin/all` | Admin | All claims |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | User | Get notifications |
| GET | `/api/notifications/unread-count` | User | Unread count |
| PATCH | `/api/notifications/:id/read` | User | Mark read |
| PATCH | `/api/notifications/read-all` | User | Mark all read |

### Smart Matching
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/matches/:itemId` | User | Get potential matches |

### Admin (all require Admin role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List users |
| PATCH | `/api/admin/users/:id` | Update user role/status |
| GET | `/api/admin/items` | All items with moderation |
| GET | `/api/admin/reports` | Content reports |
| PATCH | `/api/admin/reports/:id` | Review report |
| GET | `/api/admin/contact-messages` | Contact submissions |
| PATCH | `/api/admin/contact-messages/:id` | Update message status |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/contact/report-item/:itemId` | Report a listing |

---

## 🔗 Smart Matching Algorithm

The matching system scores potential matches between lost and found items:

| Rule | Score |
|---|---|
| Same category | +40 |
| Title keyword overlap (per word) | +15, max 30 |
| Description keyword overlap | +5 per word, max 20 |
| Exact location match | +20 |
| Location keyword overlap | +10 |
| Date within 3 days | +15 |
| Date within 7 days | +8 |

Items with a score ≥ 20 are shown. Results are sorted by score. **This is not AI — it's a transparent rule-based algorithm.**

---

## 🔐 Authentication & Authorization

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- **JWT** tokens stored in localStorage (key: `cl_token`)
- Token validated on every protected request server-side
- Two roles: `user` and `admin`
- Admin role cannot be self-assigned — set via seed script or admin panel
- Admin endpoints protected on the **server** — not just hidden in the UI

---

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import repo to [vercel.com](https://vercel.com)
3. Set **Root Directory** to `client`
4. Set environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### Backend (Render)
1. Create a new Web Service on [render.com](https://render.com)
2. Set **Root Directory** to `server`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all environment variables from `.env.example`
6. Deploy

### Database (MongoDB Atlas)
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist Render's IP (or 0.0.0.0/0 for dev)
4. Copy connection string to `MONGO_URI`

### MongoDB Compass Connection
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campusloop
```

---

## 🧪 Demo Walkthrough (Faculty Demonstration)

1. Open homepage — view live stats and recent items
2. Browse items with filters (category, type, location)
3. Register a new account or login as demo user
4. Report a lost item with photo
5. View the item's detail page, run Smart Matching
6. Log in as a different user, submit a claim
7. Log in as admin (`admin@campusloop.com`), review the claim
8. Approve the claim — claimant receives notification
9. Mark item as returned — statistics update
10. Open MongoDB Compass, view all 6 collections with live data
11. Show admin dashboard charts (bar chart + pie charts)

### Seed & Clean Test Data

```bash
# Seed demo data
cd server && npm run seed

# Remove demo data manually via MongoDB Compass or:
# In Mongo shell: db.users.deleteMany({email: {$in: ["demo@campusloop.com", "student@campusloop.com"]}})
```

---

## ⚠️ Known Limitations

- Email notifications not configured (in-app notifications only)
- No real-time WebSocket — notification bell polls every 30 seconds
- Image upload falls back to local disk if Cloudinary not configured (not persistent on Render free tier)

---

## 🔮 Future Enhancements

- WebSocket-based real-time notifications
- Email notifications via Nodemailer + SMTP
- Progressive Web App (PWA) support
- Item expiry automation
- QR code for physical item tags
- Advanced full-text search with MongoDB Atlas Search

---

## 🙏 Acknowledgements

- [Unsplash](https://unsplash.com) — placeholder images
- [Recharts](https://recharts.org) — charts library
- [React Hot Toast](https://react-hot-toast.com) — notifications
- [Mongoose](https://mongoosejs.com) — MongoDB ODM
- [Helmet.js](https://helmetjs.github.io) — security headers

---

<div align="center">
Built with ❤️ for the college CA project.<br/>
<strong>CampusLoop</strong> — Lost Something? Let's Bring It Back.
</div>
