// Manual mock for Webseries model
import { vi } from 'vitest';

function Webseries(data) { Object.assign(this, data); }
Webseries.findById = vi.fn();
Webseries.find = vi.fn();

export default Webseries;
