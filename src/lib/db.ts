import mongoose from 'mongoose';
import { env } from "./config";

export async function connectToDb() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions);
}