export default class Commands {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.registeredCommands = [];
    this.registerCommand('blockMessages', this.handleBooleans);
    this.registerCommand('learn', this.handleBooleans);
    this.registerCommand('sendMessage', this.handleSendMessage);

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
}
