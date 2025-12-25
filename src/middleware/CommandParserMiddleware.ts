import type { Bot } from '../bot.js';


export class CommandParserMiddleware implements IMiddleware {
  private commandPrefix: string;
  
  constructor(prefix: string = '/') {
    this.commandPrefix = prefix;
  }
  
  async process(
    message: IMessage,
    bot: Bot,
    next: (message: IMessage, bot: Bot) => Promise<IMessage>
  ): Promise<IMessage> {
    // 检查消息是否包含命令前缀
    for (const item of message.message) {
      if (item.type === 'text' && item.data.text.startsWith(this.commandPrefix)) {
        const parts = item.data.text
          .slice(this.commandPrefix.length)
          .trim()
          .split(/\s+/);
        
        const command = parts[0];
        const args = parts.slice(1);
        console.log(command, args)
        message.command = command || '';
        message.args = args;
        message.isCommand = true;
        break;
      }
    }
    return await next(message, bot);
  }
}