/**
 * Backend tests: Ratings routes
 * Using vi.spyOn to mock model methods directly.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authHeader } from './helpers.js';

import Rating from '../models/Rating.js';
import Movie from '../models/Movie.js';
import Webseries from '../models/Webseries.js';
import ratingsRoutes from '../routes/ratings.js';
import { errorHandler } from '../middleware/errorHandler.js';

vi.mock('../utils/notify.js', () => ({
  notifyFriends: vi.fn(),
  sendNotification: vi.fn(),
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/ratings', ratingsRoutes);
  app.use(errorHandler);
  return app;
};

const withUser = (req) => req.set(authHeader('user_test123'));

describe('POST /api/ratings', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
    vi.spyOn(Movie, 'findById').mockResolvedValue(null);
    vi.spyOn(Webseries, 'findById').mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).post('/api/ratings').send({ contentId: 'x', contentType: 'movie', rating: 8 });
    expect(res.status).toBe(401);
  });

  it('creates a rating (200)', async () => {
    const doc = { contentId: 'movie123', contentType: 'movie', rating: 8 };
    vi.spyOn(Rating, 'findOneAndUpdate').mockResolvedValue(doc);
    const res = await withUser(request(app).post('/api/ratings').send({ contentId: 'movie123', contentType: 'movie', rating: 8 }));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/saved/i);
    expect(res.body.doc).toBeDefined();
  });

  it('updates rating via upsert (200)', async () => {
    const doc = { contentId: 'movie123', contentType: 'movie', rating: 9 };
    vi.spyOn(Rating, 'findOneAndUpdate').mockResolvedValue(doc);
    const res = await withUser(request(app).post('/api/ratings').send({ contentId: 'movie123', contentType: 'movie', rating: 9 }));
    expect(res.status).toBe(200);
    expect(res.body.doc.rating).toBe(9);
  });

  it('returns 400 when rating > 10', async () => {
    const res = await withUser(request(app).post('/api/ratings').send({ contentId: 'x', contentType: 'movie', rating: 11 }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/between 1 and 10/i);
  });

  it('returns 400 when rating < 1', async () => {
    const res = await withUser(request(app).post('/api/ratings').send({ contentId: 'x', contentType: 'movie', rating: 0 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when contentType is invalid', async () => {
    const res = await withUser(request(app).post('/api/ratings').send({ contentId: 'x', contentType: 'unknown', rating: 7 }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/movie.*tv/i);
  });

  it('returns 400 when contentId is missing', async () => {
    const res = await withUser(request(app).post('/api/ratings').send({ contentType: 'movie', rating: 7 }));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/ratings/me', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).get('/api/ratings/me');
    expect(res.status).toBe(401);
  });

  it('returns rated content with userRating (200)', async () => {
    vi.spyOn(Rating, 'find').mockResolvedValue([
      { contentId: 'movie123', contentType: 'movie', rating: 8 },
      { contentId: 'series456', contentType: 'tv', rating: 7 },
    ]);
    vi.spyOn(Movie, 'find').mockResolvedValue([
      { _id: 'movie123', title: 'Test Movie', toObject: () => ({ _id: 'movie123', title: 'Test Movie' }) },
    ]);
    vi.spyOn(Webseries, 'find').mockResolvedValue([
      { _id: 'series456', title: 'Test Series', toObject: () => ({ _id: 'series456', title: 'Test Series' }) },
    ]);

    const res = await withUser(request(app).get('/api/ratings/me'));
    expect(res.status).toBe(200);
    expect(res.body.movies[0]).toHaveProperty('userRating', 8);
    expect(res.body.webseries[0]).toHaveProperty('userRating', 7);
  });
});

describe('GET /api/ratings/map', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).get('/api/ratings/map');
    expect(res.status).toBe(401);
  });

  it('returns contentId:rating map (200)', async () => {
    vi.spyOn(Rating, 'find').mockResolvedValue([
      { contentId: 'movie123', rating: 8 },
      { contentId: 'series456', rating: 6 },
    ]);
    const res = await withUser(request(app).get('/api/ratings/map'));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ movie123: 8, series456: 6 });
  });
});

describe('DELETE /api/ratings/:contentId', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization', async () => {
    const res = await request(app).delete('/api/ratings/movie123').send({ contentType: 'movie' });
    expect(res.status).toBe(401);
  });

  it('removes a rating (200)', async () => {
    vi.spyOn(Rating, 'findOneAndDelete').mockResolvedValue({ contentId: 'movie123' });
    const res = await withUser(request(app).delete('/api/ratings/movie123').send({ contentType: 'movie' }));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });
});
