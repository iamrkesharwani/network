import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { initTypesense } from '../config/typesense.js';
import { logger } from '../utils/logger.js';
import { VideoModel } from '../../modules/video/video.model.js';
import { ShortModel } from '../../modules/short/short.model.js';
import { PostModel } from '../../modules/post/post.model.js';
import { User } from '../../modules/user/user.model.js';

const backfillModel = async (model: mongoose.Model<mongoose.Document>) => {
  const cursor = model.find({}).cursor();
  let count = 0;
  let failed = 0;

  for await (const doc of cursor) {
    try {
      await doc.save();
      count++;
    } catch (error) {
      failed++;
      logger.error(
        { model: model.modelName, id: doc._id?.toString(), error },
        'Skipped a document during Typesense backfill - pre-existing data failed validation'
      );
    }
  }

  logger.info(
    { model: model.modelName, count, failed },
    'Backfilled into Typesense'
  );
};

const run = async () => {
  await connectDb();
  await initTypesense();

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
  logger.info('Typesense backfill complete');
};

run().catch((error) => {
  logger.error(error, 'Typesense backfill failed');
  process.exit(1);
});
