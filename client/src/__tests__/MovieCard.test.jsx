/**
 * Frontend tests: MovieCard component
 *
 * We mock Clerk, WatchlistContext, and the api.js library to isolate
 * the component from external dependencies.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovieCard from '../components/MovieCard';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockAddToWatchlist = vi.fn();
const mockRemoveFromWatchlist = vi.fn();
const mockSetRating = vi.fn();
const mockIsInWatchlist = vi.fn(() => false);
const mockGetRating = vi.fn(() => null);

vi.mock('../context/WatchlistContext', () => ({
  useWatchlist: () => ({
    isInWatchlist: mockIsInWatchlist,
    addToWatchlist: mockAddToWatchlist,
    removeFromWatchlist: mockRemoveFromWatchlist,
    getRating: mockGetRating,
    setRating: mockSetRating,
  }),
}));

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ user: { id: 'user_test123', firstName: 'Test' } }),
  useAuth: () => ({ getToken: vi.fn().mockResolvedValue('mock-token') }),
}));

vi.mock('../lib/api', () => ({
  addToWatchlistAPI: vi.fn().mockResolvedValue({ message: 'Movie added to watchlist.' }),
  removeFromWatchlistAPI: vi.fn().mockResolvedValue({ message: 'Movie removed from watchlist.' }),
  submitRating: vi.fn().mockResolvedValue({ message: 'Rating saved' }),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ContentDetailModal — just render null to avoid complex modal dependencies
vi.mock('../components/ContentDetailModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="content-detail-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// ── Test data ─────────────────────────────────────────────────────────────────

const mockMovie = {
  _id: 'movie123',
  id: 123,
  title: 'Dune: Part Two',
  backdrop_path: 'https://image.tmdb.org/path/dune.jpg',
  release_year: 2024,
  runtime: '166 min',
  rating: '8.6',
  votes: '300K',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MovieCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInWatchlist.mockReturnValue(false);
    mockGetRating.mockReturnValue(null);
  });

  it('renders the movie title', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Dune: Part Two')).toBeInTheDocument();
  });

  it('renders rating and votes metadata', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText(/8\.6/)).toBeInTheDocument();
    expect(screen.getByText(/300K/)).toBeInTheDocument();
  });

  it('shows "Watchlist" button when not in watchlist', () => {
    mockIsInWatchlist.mockReturnValue(false);
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('shows "In Watchlist" when already in watchlist', () => {
    mockIsInWatchlist.mockReturnValue(true);
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('In Watchlist')).toBeInTheDocument();
  });

  it('shows Rate button for logged-in users', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByRole('button', { name: /rate this movie/i })).toBeInTheDocument();
  });

  it('shows existing rating on the Rate button', () => {
    mockGetRating.mockReturnValue(8);
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  it('opens detail modal when poster is clicked', async () => {
    render(<MovieCard movie={mockMovie} />);
    const poster = screen.getByAltText('Dune: Part Two');
    fireEvent.click(poster);
    expect(await screen.findByTestId('content-detail-modal')).toBeInTheDocument();
  });

  it('closes detail modal when close button is clicked', async () => {
    render(<MovieCard movie={mockMovie} />);
    fireEvent.click(screen.getByAltText('Dune: Part Two'));

    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => expect(screen.queryByTestId('content-detail-modal')).not.toBeInTheDocument());
  });

  it('calls addToWatchlistAPI when watchlist button clicked (not in watchlist)', async () => {
    const { addToWatchlistAPI } = await import('../lib/api');
    mockIsInWatchlist.mockReturnValue(false);
    render(<MovieCard movie={mockMovie} />);

    const watchlistBtn = screen.getByRole('button', { name: /add to watchlist/i });
    await userEvent.click(watchlistBtn);

    expect(addToWatchlistAPI).toHaveBeenCalledWith({ movie: mockMovie });
    expect(mockAddToWatchlist).toHaveBeenCalledWith('movie123');
  });

  it('calls removeFromWatchlistAPI when in watchlist and button clicked', async () => {
    const { removeFromWatchlistAPI } = await import('../lib/api');
    mockIsInWatchlist.mockReturnValue(true);
    render(<MovieCard movie={mockMovie} />);

    const watchlistBtn = screen.getByRole('button', { name: /remove from watchlist/i });
    await userEvent.click(watchlistBtn);

    expect(removeFromWatchlistAPI).toHaveBeenCalledWith({ movieId: 'movie123' });
    expect(mockRemoveFromWatchlist).toHaveBeenCalledWith('movie123');
  });

  it('shows rating panel when Rate button is clicked', async () => {
    render(<MovieCard movie={mockMovie} />);
    const rateBtn = screen.getByRole('button', { name: /rate this movie/i });
    await userEvent.click(rateBtn);
    // 10 rating buttons (1-10) should appear
    const ratingButtons = screen.getAllByRole('button').filter(b =>
      /^[1-9]$|^10$/.test(b.textContent)
    );
    expect(ratingButtons).toHaveLength(10);
  });
});
