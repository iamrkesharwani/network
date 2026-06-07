import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

mongoose.connection.on('connected', () => {
  logger.info('Mongoose event: Connected to MongoDB cluster');
});

mongoose.connection.on('error', (err) => {
  logger.error(err, 'Mongoose event: Background database error occurred');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose event: Lost connection to MongoDB cluster');
});

export const connectDb = async () => {
  try {
    const uri = process.env['MONGODB_URI'];
    const dbName = process.env['DB_NAME'];

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      dbName: dbName || 'network',
    });

    logger.info(
      { dbName: dbName || 'network' },
      'Successfully connected to MongoDB initial pool'
    );
  } catch (error) {
    logger.error(error, 'Failed to execute initial connection to MongoDB');
    process.exit(1);
  }
};
