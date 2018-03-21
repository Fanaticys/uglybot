import http from "http";
import mongoose from "mongoose";
import Model from './model';
import dotenv from "dotenv";
import Controller from './controller';
import UglyBot from "./view";
dotenv.config();

http.createServer(function(request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.write('Hello world');
    response.end();
}).listen(process.env.PORT || 3000);
mongoose.connect('mongodb://localhost:27017/uglybot');

const knowledge = new mongoose.Schema({
    key: { type: String },
    value: { type: String },
    internal: [] 
});
const chats = new mongoose.Schema({
    id: { type: Number },
    speak: { type: Boolean },
    learn: { type: Boolean },
    blockMessages: { type: Boolean },
    waitingForAnswer: { type: String }
});

const modelKnowledges = mongoose.model('knowledges', knowledge);
const modelChats = mongoose.model('chats', chats);

const model = new Model(modelKnowledges, modelChats);
const bot = new UglyBot(process.env.token, { polling: true });
const controller = new Controller(model, bot);