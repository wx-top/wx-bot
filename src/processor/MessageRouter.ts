import type { IMessage } from '../interfaces/IMessage.js'
import type { IMessageHandler } from '../interfaces/IMessageHandler.js'

export class MessageRouter {
  private handlers: IMessageHandler[] = []
  private defaultHandler?: IMessageHandler

  /**
   * 注册消息处理器
   */
  registerHandler(handler: IMessageHandler): this {
    console.log(`[Router] Registering handler: ${handler.name || handler.constructor.name}`)
    this.handlers.push(handler)
    return this
  }

  /**
   * 设置默认处理器（当没有处理器能处理时使用）
   */
  setDefaultHandler(handler: IMessageHandler): this {
    this.defaultHandler = handler
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
  async route(message: IMessage): Promise<IMessage> {
    const handler = this.findHandler(message)
    
    if (handler) {
      try {
        console.log(`[Router] Using handler: ${handler.name || handler.constructor.name}`)
        const result = await handler.handle(message)
        
        if (result) {
          return result
        }
        return message // 如果处理器没有返回新消息，返回原消息
      } catch (error) {
        console.error(`[Router] Handler ${handler.name} failed:`, error)
        throw error
      }
    }
    
    console.log('[Router] No handler found for message')
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