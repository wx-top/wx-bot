import type { IMessage } from './IMessage.js'

export interface IMessageHandler {
  /**
   * 检查是否能处理此消息
   */
  canHandle(message: IMessage): boolean
  
  /**
   * 处理消息
   */
  handle(message: IMessage): Promise<IMessage | void>
  
  /**
   * 处理器名称（可选）
   */
  name?: string
  
  /**
   * 处理器描述（可选）
   */
  description?: string
}