import mongoose from 'mongoose';

const knowledgeSchema = new mongoose.Schema({
  key: { type: String },
  value: { type: String },
  internal: [],
});

export default knowledgeSchema;
