import type { Bot } from '../bot.js';
import { logger } from '../utils/logger.js';

export class MiddlewareProcessor {
  private middlewares: IMiddleware[] = [];
  private subLogger = logger.getSubLogger({
    name: 'MiddlewareProcessor',
    type: 'pretty',
  });

  use(middleware: IMiddleware): this {
    if (middleware && typeof middleware.process === 'function') {
      // 检查是否重复添加
      if (this.middlewares.includes(middleware)) {
        this.subLogger.warn('Middleware already added, skipping...');  

        return this;
      }
      this.subLogger.info(`Registering middleware: ${middleware.constructor.name}`);

      this.middlewares.push(middleware);
    } else {

      this.subLogger.warn('Invalid middleware added, skipping...');
    }
    return this;
  }

  async processMessage(message: IMessage, bot: Bot): Promise<IMessage> {
    try {
      const runner = this.createMiddlewareRunner();
      return await runner(message, bot);
    } catch (error: any) {
      this.subLogger.error('Middleware processing failed:', error);
      // 返回原始消息或错误消息
      return {
        ...message,
        error,
      };
    }
  }

  private createMiddlewareRunner() {
    return async (initialMessage: IMessage, bot: Bot): Promise<IMessage> => {
      const validMiddlewares = this.middlewares.filter(m => !!m);
      let currentIndex = 0;

      const next = async (message: IMessage, bot: Bot): Promise<IMessage> => {
        if (currentIndex >= validMiddlewares.length) {
          return message;
        }

        const middleware = validMiddlewares[currentIndex];
        currentIndex++;

        if (!middleware?.process) {
          this.subLogger.warn('Invalid middleware in chain, skipping...');
          return next(message, bot);
        }

        try {
          return await middleware.process(message, bot, next);
        } catch (error) {
          this.subLogger.error('Middleware execution error:', error);
          // 继续执行下一个中间件
          return next(message, bot);
        }
      };

      return next(initialMessage, bot);
    };
  }
}