const isCommandAvailable = command =>
  ['blockMessages', 'learn'].indexOf(command) !== -1;

export default class Configuration {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    view.on('c_command', this.handle);
  }

  handle = message => {
    const { chat, text } = message;
    const [, commandName, commandValue] = text.split(/^\/(\w+) (\w+)/);
    if (!isCommandAvailable(commandName))
      return this.view.forceSendMessage(chat.id, 'Нет такой команды.');
    //eslint-disable-next-line
    const value = commandValue === 'true' ? true : commandValue === 'false' ? false : 'unsupported';
    if (value === 'unsupported')
      return this.view.forceSendMessage(
        chat.id,
        "Не верный аргумент. Аргументом является 'false' или 'true'.",
      );
    this.model.findOneAndUpdate({ id: chat.id }, { [commandName]: value });
  };
}
