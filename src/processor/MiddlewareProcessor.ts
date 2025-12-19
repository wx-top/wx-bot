import type { IMiddleware } from '../interfaces/IMiddleware.js'
import type { IMessage } from '../interfaces/IMessage.js'
import { NCWebsocket } from 'node-napcat-ts';

export class MiddlewareProcessor {
  private middlewares: IMiddleware[] = [];

  use(middleware: IMiddleware): this {
    if (middleware && typeof middleware.process === 'function') {
      // 检查是否重复添加
      if (this.middlewares.includes(middleware)) {
        console.warn('Middleware already added, skipping...');  
        return this;
      }
          console.log(`[MiddlewareProcessor] Registering middleware: ${middleware.constructor.name}`)

      this.middlewares.push(middleware);
    } else {
      console.warn('Invalid middleware added, skipping...');
    }
    return this;
  }

  async processMessage(message: IMessage, napcat: NCWebsocket): Promise<IMessage> {
    try {
      message.napcat = napcat
      const runner = this.createMiddlewareRunner();
      return await runner(message);
    } catch (error: any) {
      console.error('Middleware processing failed:', error);
      // 返回原始消息或错误消息
      return {
        ...message,
        error,
      };
    }
  }

  private createMiddlewareRunner() {
    return async (initialMessage: IMessage): Promise<IMessage> => {
      const validMiddlewares = this.middlewares.filter(m => !!m);
      let currentIndex = 0;

      const next = async (message: IMessage): Promise<IMessage> => {
        if (currentIndex >= validMiddlewares.length) {
          return message;
        }

        const middleware = validMiddlewares[currentIndex];
        currentIndex++;

        if (!middleware?.process) {
          console.warn('Invalid middleware in chain, skipping...');
          return next(message);
        }

        try {
          return await middleware.process(message, next);
        } catch (error) {
          console.error('Middleware execution error:', error);
          // 继续执行下一个中间件
          return next(message);
        }
      };

      return next(initialMessage);
    };
  }
}