import mongoose from 'mongoose';

const chats = new mongoose.Schema({
  id: { type: Number },
  speak: { type: Boolean },
  learn: { type: Boolean },
  blockMessages: { type: Boolean },
  waitingForAnswer: { type: Boolean },
  question: { type: String },
});

export default chats;
