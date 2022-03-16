import { get } from 'lodash';

export default class Question {
  constructor(view, { knowledgesModel, chatsModel }) {
    this.view = view;
    this.knowledgesModel = knowledgesModel;
    this.chatsModel = chatsModel;
    view.on('c_question', this.handleQuestion);
    view.on('c_answer', this.handleAnswer);
    view.on('c_cancel_question', this.handleCancelQuestion);
  }

  handleQuestion = message => {
    const {
      chat: { id: chatId },
      text,
    } = message;
    const question = text.toLowerCase();
    this.knowledgesModel.findOne({ key: question }, doc => {
      if (!doc) {
        return this.chatsModel.findOne({ id: chatId }, chat => {
          if (get(chat, 'learn')) {
            this.chatsModel.findOneAndUpdate(
              { id: chatId },
              { waitingForAnswer: true, question },
            );
            return this.view.sendMessage(
              chatId,
              'Я не знаю. Что я должен ответить?',
            );
          }
          return this.view.sendMessage(chatId, 'Я не знаю.');
        });
      }
      this.view.sendMessage(chatId, get(doc, 'value'));
    });
  };

  handleAnswer = message => {
    const { chat, text } = message;
    this.chatsModel.findOne({ id: chat.id }, chat => {
      this.chatsModel.findOneAndUpdate(
        { id: chat.id },
        { waitingForAnswer: false },
      );
      this.knowledgesModel.save({ key: chat.question, value: text }, () => {
        const botMessage = /\?$/.test(text)
          ? 'Ты ответил тоже вопросом. Я постараюсь запомнить.'
          : 'Ок';
        this.view.sendMessage(chat.id, botMessage);
      });
    });
  };

  handleCancelQuestion = message => {
    const { chat } = message;
    this.view.sendMessage(chat.id, 'Ок.');
    this.chatsModel.findOneAndUpdate(
      { id: chat.id },
      { waitingForAnswer: false },
    );
  };
}
