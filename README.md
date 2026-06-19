# IECR - Indian Entertainment Content Rating

![IECR Logo](./client/src/assets/logo.png)

A comprehensive web application for discovering, tracking, and rating Indian movies and web series.

## Features
- **Authentication**: Secure login and signup via Clerk.
- **Movies & Webseries**: Browse extensive catalogs of Indian entertainment.
- **Watchlist**: Track what you want to watch.
- **Ratings & Reviews**: Rate content and read community comments.
- **Social Hub**: Add friends, send messages, and view what your friends are watching and rating in real-time.
- **Real-Time Notifications**: Get instant alerts for friend requests and messages via Socket.io.
- **Admin Panel**: Manage content directly from the UI (restricted to admins).

## Architecture & Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS v4, React Router |
| State Management | TanStack Query, Zustand, React Context |
| Animations & UI | Framer Motion, Lucide React |
| Backend | Node.js, Express 5, Socket.io |
| Database | MongoDB Atlas + Mongoose |
| Authentication | Clerk (Custom JWT decoding) |
| Background Jobs | Inngest |

## Local Development Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. **Environment Variables**
   - Create `server/.env` and `client/.env` files with required variables (see below).
4. **Run the application**
   ```bash
   # Terminal 1: Server
   cd server
   npm run server

   # Terminal 2: Client
   cd client
   npm run dev
   ```

## Environment Variables

### Server (`server/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Secret Key |
| `CLIENT_URL` | Frontend URL for CORS |
| `ADMIN_USER_IDS` | Comma-separated list of Clerk User IDs with admin access |
| `TMDB_API_KEY` | Optional: TMDB API Key for fetching details |

### Client (`client/.env`)
| Variable | Description |
|---|---|
| `VITE_BASE_URL` | Backend URL (e.g. `http://localhost:5000`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |

## Deployment Guide

### Client (Vercel)
1. Import `client` directory to Vercel.
2. Build command: `npm run build`
3. Add `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_BASE_URL` to Vercel environment variables.

### Server (Render)
1. Import `server` directory to Render as a Web Service.
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add all server environment variables.
