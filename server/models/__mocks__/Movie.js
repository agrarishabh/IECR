// Manual mock for Movie model
import { vi } from 'vitest';

function Movie(data) { Object.assign(this, data); }
Movie.find = vi.fn();
Movie.findById = vi.fn();
Movie.findByIdAndUpdate = vi.fn();
Movie.findByIdAndDelete = vi.fn();
Movie.prototype.save = vi.fn();

export default Movie;
