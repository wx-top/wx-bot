import type { Bot } from "../bot.js";

/**
 * 默认处理器
 */
export class DefaultHandler implements IMessageHandler {
  canHandle(message: IMessage): boolean {
    return true;
  }

  handle(message: IMessage, bot: Bot): Promise<IMessage | void> {
    return Promise.resolve();
  }
  
}
