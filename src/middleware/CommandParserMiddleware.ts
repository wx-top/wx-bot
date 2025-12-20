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
    // 检查消息是否以命令前缀开头
    if (message.message[0] && message.message[0].type === 'text' && message.message[0].data.text.startsWith(this.commandPrefix)) {
      const parts = message.message[0].data.text
        .slice(this.commandPrefix.length)
        .trim()
        .split(/\s+/);
      
      const command = parts[0];
      const args = parts.slice(1);
      message.command = command || '';
      message.args = args;
      message.isCommand = true;
    }
    
    return await next(message, bot);
  }
}