/**
 * Backend tests: Watchlist routes
 * Using vi.spyOn to mock model methods directly.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authHeader } from './helpers.js';

import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';
import watchlistRoutes from '../routes/watchlist.js';
import { errorHandler } from '../middleware/errorHandler.js';

vi.mock('../utils/notify.js', () => ({
  notifyFriends: vi.fn(),
  sendNotification: vi.fn(),
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/watchlist', watchlistRoutes);
  app.use(errorHandler);
  return app;
};

const withUser = (req) => req.set(authHeader('user_test123'));

const mockMovie = {
  _id: 'movie123', id: 123, title: 'Test Movie',
  backdrop_path: 'https://img.tmdb.org/test.jpg',
  release_year: 2023, runtime: '120 min', rating: '8.5', votes: '50K',
};

describe('POST /api/watchlist/add', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).post('/api/watchlist/add').send({ movie: mockMovie });
    expect(res.status).toBe(401);
  });

  it('adds a movie successfully (200)', async () => {
    vi.spyOn(Movie, 'findById').mockResolvedValue(mockMovie);
    vi.spyOn(Watchlist, 'findOne').mockResolvedValue(null);
    vi.spyOn(Watchlist.prototype, 'save').mockResolvedValue(true);
    const res = await withUser(request(app).post('/api/watchlist/add').send({ movie: mockMovie }));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/added/i);
  });

  it('returns 409 when movie already in watchlist', async () => {
    vi.spyOn(Movie, 'findById').mockResolvedValue(mockMovie);
    vi.spyOn(Watchlist, 'findOne').mockResolvedValue({ userId: 'u', movieId: 'movie123' });
    const res = await withUser(request(app).post('/api/watchlist/add').send({ movie: mockMovie }));
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already/i);
  });

  it('returns 404 when movie not in DB', async () => {
    vi.spyOn(Movie, 'findById').mockResolvedValue(null);
    const res = await withUser(request(app).post('/api/watchlist/add').send({ movie: mockMovie }));
    expect(res.status).toBe(404);
  });

  it('returns 400 when no movie/webseries provided', async () => {
    const res = await withUser(request(app).post('/api/watchlist/add').send({}));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/watchlist/me', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).get('/api/watchlist/me');
    expect(res.status).toBe(401);
  });

  it('returns movies and webseries arrays (200)', async () => {
    vi.spyOn(Watchlist, 'find').mockReturnValue({
      populate: vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue([
          { movieId: { _id: 'movie123', title: 'Test Movie', toObject: () => ({ _id: 'movie123', title: 'Test Movie' }) }, webseriesId: null },
        ]),
      }),
    });
    const res = await withUser(request(app).get('/api/watchlist/me'));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.movies)).toBe(true);
    expect(res.body.movies[0].title).toBe('Test Movie');
  });
});

describe('GET /api/watchlist/ids', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).get('/api/watchlist/ids');
    expect(res.status).toBe(401);
  });

  it('returns array of id strings (200)', async () => {
    vi.spyOn(Watchlist, 'find').mockResolvedValue([
      { movieId: 'movie123', webseriesId: null },
      { movieId: null, webseriesId: 'series456' },
    ]);
    const res = await withUser(request(app).get('/api/watchlist/ids'));
    expect(res.status).toBe(200);
    expect(res.body).toContain('movie123');
    expect(res.body).toContain('series456');
  });
});

describe('DELETE /api/watchlist/remove', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).delete('/api/watchlist/remove').send({ movieId: 'x' });
    expect(res.status).toBe(401);
  });

  it('removes a movie (200)', async () => {
    vi.spyOn(Watchlist, 'findOneAndDelete').mockResolvedValue({ userId: 'u', movieId: 'movie123' });
    const res = await withUser(request(app).delete('/api/watchlist/remove').send({ movieId: 'movie123' }));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('removes a webseries (200)', async () => {
    vi.spyOn(Watchlist, 'findOneAndDelete').mockResolvedValue({ userId: 'u', webseriesId: 'series456' });
    const res = await withUser(request(app).delete('/api/watchlist/remove').send({ webseriesId: 'series456' }));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('returns 400 without movieId or webseriesId', async () => {
    const res = await withUser(request(app).delete('/api/watchlist/remove').send({}));
    expect(res.status).toBe(400);
  });
});
