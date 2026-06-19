import mongoose from 'mongoose';
import { logger } from '../lib/logger.js';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => logger.info('[DB] Database connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/IECR`);
    } catch (error) {
        logger.error('[DB ERROR]', error.message);
    }
}

export default connectDB;