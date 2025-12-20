/**
 * 默认处理器
 */
export class DefaultHandler implements IMessageHandler {
  canHandle(message: IMessage): boolean {
    return true;
  }

  handle(message: IMessage): Promise<IMessage | void> {
    return Promise.resolve();
  }
}
