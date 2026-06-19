/**
 * Backend tests: Movies routes
 * Using vi.spyOn to mock model methods directly.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authHeader } from './helpers.js';

import Movie from '../models/Movie.js';
import Comment from '../models/Comment.js';
import movieRoutes from '../routes/movies.js';
import { errorHandler } from '../middleware/errorHandler.js';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/movies', movieRoutes);
  app.use(errorHandler);
  return app;
};

const withAdmin = (req) => req.set(authHeader('admin_user_123'));
const withUser = (req) => req.set(authHeader('regular_user_456'));

const validPayload = {
  _id: 'movie999', id: 999, title: 'Dune: Part Two',
  backdrop_path: 'https://image.tmdb.org/path/dune.jpg',
  release_year: 2024, runtime: '166 min', rating: '8.6', votes: '300K',
};

describe('GET /api/movies', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
    vi.spyOn(Comment, 'aggregate').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 with movies array (public)', async () => {
    vi.spyOn(Movie, 'find').mockReturnValue({ lean: vi.fn().mockResolvedValue([{ _id: 'movie123', title: 'Test Movie' }]) });
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns empty array when no movies', async () => {
    vi.spyOn(Movie, 'find').mockReturnValue({ lean: vi.fn().mockResolvedValue([]) });
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/movies', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/movies').send(validPayload);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    const res = await withUser(request(app).post('/api/movies').send(validPayload));
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/forbidden/i);
  });

  it('returns 400 when required field missing', async () => {
    const { title, ...incomplete } = validPayload;
    const res = await withAdmin(request(app).post('/api/movies').send(incomplete));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/(required|expected.*received|invalid)/i);
  });

  it('creates movie as admin (201)', async () => {
    vi.spyOn(Movie.prototype, 'save').mockResolvedValue(validPayload);
    const res = await withAdmin(request(app).post('/api/movies').send(validPayload));
    expect(res.status).toBe(201);
  });
});

describe('PUT /api/movies/:id', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 403 for non-admin', async () => {
    const res = await withUser(request(app).put('/api/movies/movie123').send({ rating: '9.0' }));
    expect(res.status).toBe(403);
  });

  it('returns 404 when movie not found', async () => {
    vi.spyOn(Movie, 'findByIdAndUpdate').mockResolvedValue(null);
    const res = await withAdmin(request(app).put('/api/movies/nonexistent').send({ rating: '9.0' }));
    expect(res.status).toBe(404);
  });

  it('updates movie (200)', async () => {
    vi.spyOn(Movie, 'findByIdAndUpdate').mockResolvedValue({ ...validPayload, rating: '9.0' });
    const res = await withAdmin(request(app).put('/api/movies/movie999').send({ rating: '9.0' }));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });
});

describe('DELETE /api/movies/:id', () => {
  let app;
  beforeEach(() => { 
    app = buildApp(); 
    vi.clearAllMocks(); 
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 403 for non-admin', async () => {
    const res = await withUser(request(app).delete('/api/movies/movie123'));
    expect(res.status).toBe(403);
  });

  it('returns 404 when movie not found', async () => {
    vi.spyOn(Movie, 'findByIdAndDelete').mockResolvedValue(null);
    const res = await withAdmin(request(app).delete('/api/movies/nonexistent'));
    expect(res.status).toBe(404);
  });

  it('deletes movie (200)', async () => {
    vi.spyOn(Movie, 'findByIdAndDelete').mockResolvedValue(validPayload);
    const res = await withAdmin(request(app).delete('/api/movies/movie999'));
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
