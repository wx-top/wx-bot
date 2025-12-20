import type { Bot } from '../bot.js'
import { DefaultHandler } from '../handlers/DefaultHandler.js'
import { logger } from '../utils/logger.js'

export class MessageRouter {
  private handlers: IMessageHandler[] = []
  private defaultHandler = new DefaultHandler();
  private subLogger = logger.getSubLogger({ name: 'MessageRouter', type: 'pretty' })
  

  /**
   * 注册消息处理器
   */
  registerHandler(handler: IMessageHandler): this {
    this.subLogger.info(`Registering handler: ${handler.name || handler.constructor.name}`)
    this.handlers.push(handler)
    return this
  }

  /**
   * 找到合适的处理器
   */
  findHandler(message: IMessage): IMessageHandler | undefined {
    // 按注册顺序查找第一个能处理的处理器
    for (const handler of this.handlers) {
      if (handler.canHandle(message)) {
        return handler
      }
    }
    return this.defaultHandler
  }

  /**
   * 处理消息
   */
  async route(message: IMessage, bot: Bot): Promise<IMessage> {
    const handler = this.findHandler(message)
    
    if (handler) {
      try {
        this.subLogger.info(`Using handler: ${handler.name || handler.constructor.name}`)
        const result = await handler.handle(message, bot)
        
        if (result) {
          return result
        }
        return message // 如果处理器没有返回新消息，返回原消息
      } catch (error) {
        this.subLogger.error(`Handler ${handler.name} failed:`, error)
        throw error
      }
    }
    this.subLogger.warn('No handler found for message')
    return message // 没有处理器，返回原消息
  }

  /**
   * 获取所有处理器信息
   */
  getHandlersInfo(): Array<{name: string, description?: string}> {
    return this.handlers.map(handler => ({
      name: handler.name || handler.constructor.name,
      description: handler.description || '',
    }))
  }
}