import debug from 'debug';
import EventEmitter from 'eventemitter3';
const d = debug('ugly-bot:model');

class Model extends EventEmitter {
    constructor(knowledgeModel, chatModel){
        super();
        this.knowledgeModel = knowledgeModel;
        this.chatModel = chatModel;
    }

    saveKnowledge(obj, cb = () => {}){
        const knowledge = new this.knowledgeModel(obj);
        knowledge.save((err, result) => {
            if (err) {
                this.emit('dbError');
                throw err;
            }
            cb();
        });
    }
    
    getKnowledge({ id, key }, cb){
        this.knowledgeModel.findOne({ key }, (err, doc) => {
            if (err) {
                this.emit('dbError', id);
                throw err;
            }
            cb(doc); 
        });
    }

    updateChat({id, key, value}){
        this.chatModel.findOneAndUpdate({ id }, { [key]: value }, { upsert: true }, (err) => {
            if(err) throw err;
            this.emit('updateChat', { id, key, value });
        });
    }

    getChats(cb){
        this.chatModel.find({}, { _id: 0 }, { lean: true }, (err, docs) => {
            if (err) throw err;
            cb(docs);
        });
    }




}

export default Model;