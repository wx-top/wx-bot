import type { IMiddleware } from '../interfaces/IMiddleware.js'
import type { IMessage } from '../interfaces/IMessage.js'

export class LoggingMiddleware implements IMiddleware {
  async process(
    message: IMessage,
    next: (message: IMessage) => Promise<IMessage>
  ): Promise<IMessage> {
    const msgType = message.message_type === 'private' ? 'Private' : 'Group';
    const groupId = message.message_type === 'group' ? message.group_id || 'unknown' : 'N/A';

    const senderId = message.sender?.user_id || 'unknown';
    const messagePreview = message.message
      .map(m => {
        if (m.type === 'text') {
          return m.data.text;
        } else if (m.type === 'image') {
          return `[Image][${m.data.url}]`;
        } else {
          return `[${m.type}]`;
        }
      })
      .join(' ');
    console.log(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] [${msgType}][${groupId ? groupId : ''}][${senderId}] ${message.sender?.nickname || 'unknown'}: ${messagePreview}`);
    const result = await next(message);
    console.log(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] Processed message ${result.message_id}`);
    return result;
  }
}