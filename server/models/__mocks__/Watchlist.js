// Manual mock for Watchlist model
import { vi } from 'vitest';

function Watchlist(data) { Object.assign(this, data); }
Watchlist.findOne = vi.fn();
Watchlist.find = vi.fn();
Watchlist.findOneAndDelete = vi.fn();
Watchlist.syncIndexes = vi.fn().mockResolvedValue(true);
Watchlist.prototype.save = vi.fn().mockResolvedValue(true);

export default Watchlist;
