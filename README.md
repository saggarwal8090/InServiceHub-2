# 🏠 InServiceHub

**India's Trusted Home Services Marketplace** — Connect with verified plumbers, electricians, carpenters & more in your city.

![InServiceHub Hero](client/public/images/hero-banner.png)

## ✨ Features

- 🔍 **Search Providers** — Find verified service providers by city and service type
- 📋 **Instant Booking** — Book directly or broadcast to all providers in your area
- 🟢 **Real-time Availability** — See which providers are online right now
- ⭐ **Ratings & Reviews** — Read customer reviews before booking
- 📱 **Responsive Design** — Works beautifully on desktop, tablet, and mobile
- 🔒 **Secure Authentication** — JWT-based login with bcrypt password hashing
- 👤 **Dual Dashboards** — Separate dashboards for customers and service providers

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router, Vite, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite3 |
| **Auth** | JWT + bcrypt |
| **Security** | Helmet, CORS, Rate Limiting |
| **Deployment** | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### 1. Clone & Install

```bash
git clone https://github.com/saggarwal8090/InServiceHub.git
cd InServiceHub

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Seed the Database

```bash
cd server
node seed.js
```

This creates 20 providers, 5 customers, sample bookings, and reviews.

**Test credentials:** `rajesh@example.com` / `password123`

### 3. Run in Development

```bash
# Terminal 1 — Start server
cd server
node index.js

# Terminal 2 — Start client (dev mode)
cd client
npm run dev
```

### 4. Run in Production

```bash
# Build client
cd client && npm run build && cd ..

# Start production server (serves both API + frontend)
cd server
NODE_ENV=production JWT_SECRET=your_secret_here node index.js
```
App available at `http://localhost:5001`

### 5. Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📁 Project Structure

```
InServiceHub/
├── client/                  # React frontend (Vite)
│   ├── public/images/       # Service images
│   ├── src/
│   │   ├── components/      # Navbar, BookingModal, ProviderCard, ErrorBoundary
│   │   ├── context/         # AuthContext (JWT auth state)
│   │   ├── pages/           # Home, Search, Login, Register, Dashboards, Profile
│   │   └── App.jsx          # Routes with lazy loading
│   ├── .env                 # Dev API URL
│   ├── .env.production      # Prod API URL (same-origin)
│   └── vite.config.js       # Build config with code splitting
├── server/
│   ├── index.js             # Express server, API routes, middleware
│   ├── seed.js              # Database seeder
│   ├── .env.example         # Environment template
│   └── package.json
├── Dockerfile               # Multi-stage production build
├── docker-compose.prod.yml  # Production deployment
└── .gitignore
```

## 🔒 Security Features

- **Helmet** — Secure HTTP headers
- **Rate Limiting** — 100 req/15min (API), 20 req/15min (auth)
- **Input Validation** — All endpoints validated
- **Password Hashing** — bcrypt with 10 salt rounds
- **JWT Authentication** — Stateless token-based auth
- **CORS** — Configured for same-origin production
- **Graceful Shutdown** — Proper SIGTERM/SIGINT handling

## 🌐 Available Cities

Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh, Kochi, Indore, Bhopal, Nagpur, Surat, Vadodara, Noida, Gurgaon, Ghaziabad

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login & get JWT |
| GET | `/providers` | ❌ | Search providers |
| GET | `/providers/:id` | ❌ | Provider details |
| POST | `/bookings` | ✅ | Create booking |
| GET | `/my-bookings` | ✅ | User's bookings |
| GET | `/booking-requests` | ✅ | Broadcast requests (provider) |
| PUT | `/bookings/:id/accept` | ✅ | Accept booking |
| PUT | `/bookings/:id/status` | ✅ | Update booking status |
| POST | `/reviews` | ✅ | Submit review |
| PUT | `/toggle-online` | ✅ | Toggle provider status |
| GET | `/api/profile` | ✅ | Get user profile |
| PUT | `/api/profile` | ✅ | Update profile |
| GET | `/api/health` | ❌ | Health check |

## 📄 License

MIT

---

Made with ❤️ in India
