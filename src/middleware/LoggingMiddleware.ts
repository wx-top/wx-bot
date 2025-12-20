import type { Bot } from '../bot.js';
import { logger } from '../utils/logger.js';


export class LoggingMiddleware implements IMiddleware {
  private subLogger = logger.getSubLogger({ name: 'LoggingMiddleware', type: 'pretty' });
  async process(
    message: IMessage,
    bot: Bot,
    next: (message: IMessage, bot: Bot) => Promise<IMessage>
  ): Promise<IMessage> {
    const msgType = message.message_type === 'private' ? 'Private' : 'Group';
    const groupId = message.message_type === 'group' ? message.group_id || 'unknown' : 'N/A';

    const senderId = message.sender?.user_id || 'unknown';
    const messagePreview = message.message
      .map((m: any) => {
        if (m.type === 'text') {
          return m.data.text;
        } else if (m.type === 'image') {
          return `[Image][${m.data.url}]`;
        } else {
          return `[${m.type}]`;
        }
      })
      .join(' ');
    this.subLogger.info(`[${msgType}][${groupId ? groupId : ''}][${senderId}][${message.message_id}] ${message.sender?.nickname || 'unknown'}: ${messagePreview}`);
    const result = await next(message, bot);
    return result;
  }
}