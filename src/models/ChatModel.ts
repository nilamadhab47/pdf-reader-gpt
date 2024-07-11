import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  question: String,
  answer: String,
  timestamp: Date,
});

export const Chats = mongoose.model('ChatStorage', chatSchema);