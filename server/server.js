import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import helmet from 'helmet';
import connectDB from './configs/db.js';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';
import Watchlist from './models/Watchlist.js';
import validateEnv from './middleware/validateEnv.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import movieRoutes from './routes/movies.js';
import webseriesRoutes from './routes/webseries.js';
import watchlistRoutes from './routes/watchlist.js';
import ratingsRoutes from './routes/ratings.js';
import tmdbRoutes from './routes/tmdb.js';
import adminRoutes from './routes/admin.js';
import friendsRoutes from './routes/friends.js';
import messagesRoutes from './routes/messages.js';
import commentsRoutes from './routes/comments.js';
import notificationsRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';
import { initSocket } from './socket.js';
import { logger } from './lib/logger.js';

// Validate required env vars before anything else
validateEnv();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Initialize Socket.io
initSocket(server);

const allowedOrigins = [
  'http://localhost:5173',
  'https://iecr.vercel.app',
];

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// ── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Database ─────────────────────────────────────────────────────────────────
await connectDB();
await Watchlist.syncIndexes();
logger.info('[DB] Watchlist indexes synced successfully');

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Auth debug (remove after fixing) ─────────────────────────────────────────
app.get('/api/auth-test', (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = req.auth?.userId;
  res.json({
    hasAuthHeader: !!authHeader,
    headerPrefix: authHeader?.substring(0, 15),
    userId: userId || null,
    authStatus: req.auth?.status || null,
    authReason: req.auth?.reason || null,
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Server is Live'));
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/movies', movieRoutes);
app.use('/api/webseries', webseriesRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
server.listen(port, () => {
  logger.info(`[SERVER] Running on http://localhost:${port}`);
});
