import type { MessageHandler, NCWebsocket } from 'node-napcat-ts'

// 添加额外类型
export type IMessage = (MessageHandler['message.private'] | MessageHandler['message.group']) & {
  command?: string;
  args?: string[];
  isCommand?: boolean;
  error?: Error;
  napcat?: NCWebsocket
}

