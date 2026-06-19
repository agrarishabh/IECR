/**
 * Frontend tests: WatchlistContext
 *
 * Tests the context's state management helpers (isInWatchlist, addToWatchlist,
 * removeFromWatchlist, getRating, setRating, removeRating) in isolation,
 * without hitting the real API.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { WatchlistProvider, useWatchlist } from '../context/WatchlistContext';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock Clerk to return a logged-in user
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: { id: 'user_test123' },
    isLoaded: true,
  }),
}));

// Mock the api.js calls the context makes on mount
vi.mock('../lib/api', () => ({
  getWatchlistIds: vi.fn().mockResolvedValue(['movie123', 'series456']),
  getRatingsMap: vi.fn().mockResolvedValue({ movie123: 8, series456: 6 }),
}));

// ── Helper: component that consumes context and exposes values via data-testid ─

const TestConsumer = ({ action, payload }) => {
  const ctx = useWatchlist();

  const handleAction = () => {
    if (action === 'add') ctx.addToWatchlist(payload);
    if (action === 'remove') ctx.removeFromWatchlist(payload);
    if (action === 'setRating') ctx.setRating(payload.id, payload.rating);
    if (action === 'removeRating') ctx.removeRating(payload);
  };

  return (
    <div>
      <span data-testid="in-watchlist">{String(ctx.isInWatchlist(payload?.id || payload))}</span>
      <span data-testid="rating">{String(ctx.getRating(payload?.id || payload))}</span>
      <button data-testid="action-btn" onClick={handleAction}>action</button>
    </div>
  );
};

const renderWithProvider = (props = {}) =>
  render(
    <WatchlistProvider>
      <TestConsumer {...props} />
    </WatchlistProvider>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('WatchlistContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads watchlist IDs from API on mount', async () => {
    renderWithProvider({ payload: 'movie123' });
    // After API response resolves, isInWatchlist('movie123') should be true
    await waitFor(() => {
      expect(screen.getByTestId('in-watchlist').textContent).toBe('true');
    });
  });

  it('isInWatchlist returns false for unknown ID initially', async () => {
    renderWithProvider({ payload: 'unknown_id' });
    await waitFor(() => {
      expect(screen.getByTestId('in-watchlist').textContent).toBe('false');
    });
  });

  it('addToWatchlist updates the set', async () => {
    renderWithProvider({ action: 'add', payload: 'newmovie999' });

    // Initially false for a new ID
    await waitFor(() => {
      expect(screen.getByTestId('in-watchlist').textContent).toBe('false');
    });

    // Trigger addToWatchlist
    act(() => {
      screen.getByTestId('action-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('in-watchlist').textContent).toBe('true');
    });
  });

  it('removeFromWatchlist removes from the set', async () => {
    renderWithProvider({ action: 'remove', payload: 'movie123' });

    // Should be in watchlist after API loads
    await waitFor(() => {
      expect(screen.getByTestId('in-watchlist').textContent).toBe('true');
    });

    // Remove it
    act(() => {
      screen.getByTestId('action-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('in-watchlist').textContent).toBe('false');
    });
  });

  it('getRating returns loaded rating from API', async () => {
    renderWithProvider({ payload: 'movie123' });
    await waitFor(() => {
      expect(screen.getByTestId('rating').textContent).toBe('8');
    });
  });

  it('getRating returns null for unrated content', async () => {
    renderWithProvider({ payload: 'unrated_content' });
    await waitFor(() => {
      expect(screen.getByTestId('rating').textContent).toBe('null');
    });
  });

  it('setRating updates rating in state', async () => {
    renderWithProvider({ action: 'setRating', payload: { id: 'movie999', rating: 9 } });

    await waitFor(() => {
      expect(screen.getByTestId('rating').textContent).toBe('null');
    });

    act(() => {
      screen.getByTestId('action-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('rating').textContent).toBe('9');
    });
  });

  it('removeRating removes from map', async () => {
    renderWithProvider({ action: 'removeRating', payload: 'movie123' });

    await waitFor(() => {
      expect(screen.getByTestId('rating').textContent).toBe('8');
    });

    act(() => {
      screen.getByTestId('action-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('rating').textContent).toBe('null');
    });
  });
});
