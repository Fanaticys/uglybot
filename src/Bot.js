import TelegramBot from 'node-telegram-bot-api';

class Bot extends TelegramBot {
  constructor(...args) {
    super(...args);

    this.on('text', this.route);
  }

  sendMessage(...args) {
    this.emit('c_bot-message', () => super.sendMessage(...args), ...args);
  }

  forceSendMessage(id, msg) {
    super.sendMessage(id, msg);
  }

  route = message => this.emit('c_route', message);
}

export default Bot;
