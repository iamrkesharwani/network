import dns from 'node:dns';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { env } from '../env/env.js';

if (env.NODE_ENV === 'development') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  logger.info('Development mode: Forced custom DNS for MongoDB SRV resolution');
}

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
    const uri = env.MONGODB_URI;
    const dbName = env.DB_NAME;

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
