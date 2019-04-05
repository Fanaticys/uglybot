export default class Message {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    view.on('c_message', this.handleMessage);
  }

  handleMessage = () => {};

  // handleMessage = message => {
  //   const { chat, text } = message;
  //   const response = `<a href='google.com'>${text}</a>`;
  //   this.view.sendMessage(chat.id, response, { parse_mode: 'HTML' });
  // };
}
