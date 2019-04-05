import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Bot from 'Bot';
import Model from 'models/Model';
import knowledge from 'models/schemas/knowledge';
import chats from 'models/schemas/chats';
import * as controllers from 'controllers';

const bot = new Bot(process.env.token, { polling: true });
const knowledgesModel = new Model('knowledges', knowledge);
const chatsModel = new Model('chats', chats);
new controllers.Configuration(bot, chatsModel);
new controllers.Commands(bot, chatsModel);
new controllers.Message(bot);
new controllers.Question(bot, { knowledgesModel, chatsModel });

mongoose.connect('mongodb://localhost:27017/uglybot');
