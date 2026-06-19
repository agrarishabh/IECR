// Manual mock for Rating model
import { vi } from 'vitest';

function Rating() {}
Rating.findOneAndUpdate = vi.fn();
Rating.find = vi.fn();
Rating.findOneAndDelete = vi.fn();

export default Rating;
