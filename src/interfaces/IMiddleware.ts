import type { IMessage } from './IMessage.js'
export interface IMiddleware {
  process(
    message: IMessage, 
    next: (message: IMessage) => Promise<IMessage>
  ): Promise<IMessage>;
}