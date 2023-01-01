import { openai } from 'providers';

export default class Commands {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.registeredCommands = [];
    this.registerCommand('blockMessages', this.handleBooleans);
    this.registerCommand('learn', this.handleBooleans);
    this.registerCommand('sendMessage', this.handleSendMessage);
    this.registerCommand('dalle', this.handleDalle);

    view.on('c_command', this.handle);
  }

  registerCommand(name, handler) {
    this.registeredCommands.push({ name, handler });
  }

  getRegisteredCommand(commandName) {
    return this.registeredCommands.find(({ name }) => name === commandName);
  }

  handle = message => {
    const { chat, text } = message;
    const [, commandName] = text.split(/^\/(\w+)/);
    const registeredCommand = this.getRegisteredCommand(commandName);
    if (!registeredCommand) {
      return this.view.forceSendMessage(chat.id, 'Нет такой команды.');
    }
    registeredCommand.handler(message);
  };

  handleBooleans = message => {
    const { chat, text } = message;
    const [, commandName, commandValue] = text.split(/^\/(\w+) (\w+)/);
    const value =
      commandValue === 'true'
        ? true
        : commandValue === 'false'
        ? false
        : 'unsupported';
    if (value === 'unsupported')
      return this.view.forceSendMessage(
        chat.id,
        "Не верный аргумент. Аргументом является 'false' или 'true'.",
      );
    this.model.findOneAndUpdate({ id: chat.id }, { [commandName]: value });
  };

  handleSendMessage = message => {
    const { text } = message;
    const [, , toChatId, messageToSend] = text.split(/(\w+) (-?\d+) (.+)/);
    return this.view.forceSendMessage(toChatId, messageToSend);
  };

  handleDalle = async message => {
    const { chat, text } = message;
    const [, , prompt = ''] = text.split(/^\/(\w+)/);

    const response = await openai.createImage({
      prompt: prompt.trim(),
      n: 1,
      size: '256x256',
    });

    const url = response.data.data[0].url;

    return this.view.sendPhoto(chat.id, url);
  };
}
