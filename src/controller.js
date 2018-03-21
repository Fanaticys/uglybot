import debug from 'debug';
const d = debug('ugly-bot:controller');

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        model.on('dbError', ::this.handleDbError);
        model.on('updateChat', ::this.handleUpdateChat);
        view.on('polling_error', ::this.handleError);
        view.on('error', :: this.handleError);
        view.on('question', ::this.handleQuestion);
        view.on('answer', ::this.handleAnswer);
        view.on('sticker', ::this.handleSticker);
        view.on('/setting', ::this.handleSetting);
        
        this._init();
    }

    _init() { this.model.getChats(chats => { this.view.chats = chats }) }
    handleError(error){ throw error }
    handleUpdateChat({ id, key, value }) { this.view.updateChat({ id, key, value }) }
    handleDbError(id){ this.view.sendMessage(id, "У меня какая-то проблема с памятью.") }
    handleSticker(msg){ this.view.sendMessage(msg.chat.id, "норм стикер!") }

    handleSetting({id, name, value}){
        d(`${name} emited`);
        if (value == 'true') {
            this.model.updateChat({ id, key: name, value: true });
        } else if (value == 'false') {
            this.model.updateChat({ id, key: name, value: false });
        } else {
            this.view.sendWarning(id, 'Не верный аргумент. Аргументом является "false" или "true"');
        }
    }

    handleAnswer({ id, message, question }){
        this.model.saveKnowledge({ id, key: question, value: message }, () => {
            (() => {
                if (/\?$/.test(message)) return this.view.sendMessage(id, "Ты ответил тоже вопросом. Я постараюсь запомнить.");
                this.view.sendMessage(id, 'Ок. Я постараюсь запомнить.');
            })();
        });
    }

    handleQuestion({ id, message }) {
        this.model.getKnowledge({ id, key: message }, (doc) => {
            if (!doc) {
                this.view.waitingForAnswer({ id, question: message });
                if (this.view.canLearn(id)) {
                    return this.view.sendMessage(id, 'Я не знаю. Что я должен ответить?');
                }
                this.view.sendMessage(id, 'Я не знаю');
            } else if (doc) {
                this.view.sendMessage(id, doc.value);
            }
        });
    }
}

export default Controller;