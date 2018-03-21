import TelegramBot from 'node-telegram-bot-api';
import debug from 'debug';
const d = debug('ugly-bot:view');

class UglyBot extends TelegramBot {
    constructor(...args){
        super(...args);
        this.chats = [];
        this.default = { speak: true, learn: true, blockMessages: false };
        this.availableChatStates = [ 'learn', 'blockMessages' ];
        
        this.onText(/^\/(\w+) (\w+)/, ::this.handleSetting);
        this.on('text', ::this.makeNewEvent);
    }

    handleSetting(msg, [source, name, value]){
        const { chat: { id } } = msg;
        if (this.availableChatStates.indexOf(name) != -1) {
            if (String(this.getState({ id, key: name })) === value) return false;
            this.emit(`/setting`, { id, name, value });
        } else {
            this.sendWarning(id, 'Нет такой команды');
        }
    }
    
    makeNewEvent(msg){
        const { chat: { id } } = msg;
        const message = msg.text.toLowerCase();
        d('Text message in chat: %s', id);
        if (/^\//.test(message)) return false;
        if (this.isWaitingForAnswer(id)) {
            if (/\-/.test(message)) {
                this.sendMessage(id, 'Ок.');
                this.removeState(id, 'waitingForAnswer');
                return false;
            };
            const question = this.getState({ id, key: 'waitingForAnswer' });
            this.removeState(id, 'waitingForAnswer');
            return this.emit('answer', { id, message, question });
        } else if (!this.isWaitingForAnswer(id)) {
            if (/\?$/.test(message)) {
                return this.emit('question', { id, message });
            }
        }
    }

    removeState(id, key) {            
        const chat = this.chats.find(chat => chat.id == id);
        if(chat) delete chat[key];
    }

    getState({ id, key }) {
        const chat = this.chats.find(chat => chat.id == id);
        return chat && key in chat ? chat[key] : key in this.default ? this.default[key] : false;
    }
    
    isWaitingForAnswer(id) {
        const chat = this.chats.find(chat => chat.id == id);
        if (chat && chat.waitingForAnswer) return true;
        return false;
    }

    waitingForAnswer({ id, question }){
        if(this.canLearn(id)){
            this.updateChat({ id, key: 'waitingForAnswer', value: question });
        }
    }

    canLearn(id){
        return this.getState({ id, key: 'learn'});
    }

    sendMessage(id, msg){
        if(this.getState({id, key: 'blockMessages'})) return false;
        d('Sending message to chat: %s', id);
        super.sendMessage(id, msg);
    }

    sendWarning(id, msg) {
        d('Sending message to chat: %s', id);
        super.sendMessage(id, msg);
    }

    updateChat({ id, key, value }){
        d('Chat before: %o', this.chats);
        const chat = this.chats.find(chat => chat.id == id);
        if(chat){
            chat[key] = value;
            d('Chat after update: %o', this.chats);
            return;
        }
        this.chats.push({ id, [key]: value });
        d('Chat after push: %o', this.chats);
    }

}

export default UglyBot;