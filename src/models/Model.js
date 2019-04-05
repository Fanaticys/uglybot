import EventEmitter from 'eventemitter3';
import mongoose from 'mongoose';

export default class Model extends EventEmitter {
  constructor(modelName, schema) {
    super();
    this.name = modelName;
    this.model = mongoose.model(modelName, schema);
  }

  findOne = (match, cb) => {
    this.model.findOne(match, (err, doc) => {
      if (err) {
        this.emit('dbError');
        throw err;
      }
      cb(doc);
    });
  };

  findOneAndUpdate = (match, update, cb = () => {}) => {
    this.model.findOneAndUpdate(match, update, { upsert: true }, err => {
      if (err) throw err;
      cb();
    });
  };

  save = (obj, cb) => {
    const data = new this.model(obj);
    data.save(err => {
      if (err) {
        this.emit('dbError');
        throw err;
      }
      cb();
    });
  };
}
