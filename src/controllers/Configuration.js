import { get } from 'lodash';

export default class Configuration {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    view.on('c_bot-message', this.handleBotMessage);
    view.on('polling_error', this.handlePollingError);
    view.on('error', this.handleError);
    view.on('c_route', this.handleRoute);
  }

  handleBotMessage = (send, chatId, ...rest) => {
    this.model.findOne({ id: chatId }, chat => {
      if (get(chat, 'blockMessages')) return;
      send(...rest);
    });
  };

  handleRoute = message => {
    const {
      chat: { id: chatId },
      text,
    } = message;
    this.model.findOne({ id: chatId }, chat => {
      if (get(chat, 'waitingForAnswer')) {
        // eslint-disable-next-line
        if (/\-/.test(text)) return this.view.emit('c_cancel_question', message);
        return this.view.emit('c_answer', message);
      } else {
        if (/\?$/.test(text)) {
          return this.view.emit('c_question', message);
        } else if (/^\/(\w+) (\w+)/.test(text)) {
          return this.view.emit('c_command', message);
        }
        return this.view.emit('c_message', message);
      }
    });
  };

  handleError = error => {
    throw error;
  };

  handlePollingError = error => {
    throw error;
  };
}
