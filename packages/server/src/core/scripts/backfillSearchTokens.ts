import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { VideoModel } from '../../modules/video/video.model.js';
import { ShortModel } from '../../modules/short/short.model.js';
import { PostModel } from '../../modules/post/post.model.js';
import { User } from '../../modules/user/user.model.js';

const backfillModel = async (model: mongoose.Model<mongoose.Document>) => {
  const cursor = model.find({}).cursor();
  let count = 0;

  for await (const doc of cursor) {
    await doc.save();
    count++;
  }

  logger.info({ model: model.modelName, count }, 'Backfilled searchTokens');
};

const run = async () => {
  await connectDb();

  await backfillModel(
    VideoModel as unknown as mongoose.Model<mongoose.Document>
  );
  await backfillModel(
    ShortModel as unknown as mongoose.Model<mongoose.Document>
  );
  await backfillModel(
    PostModel as unknown as mongoose.Model<mongoose.Document>
  );
  await backfillModel(User as unknown as mongoose.Model<mongoose.Document>);

  await mongoose.disconnect();
  logger.info('searchTokens backfill complete');
};

run().catch((error) => {
  logger.error(error, 'searchTokens backfill failed');
  process.exit(1);
});
