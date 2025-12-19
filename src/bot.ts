import { NCWebsocket } from 'node-napcat-ts'
import { config } from './config/index.js'
import { MiddlewareProcessor } from './processor/MiddlewareProcessor.js';
import { LoggingMiddleware } from './middleware/LoggingMiddleware.js';
import { CommandParserMiddleware } from './middleware/CommandParserMiddleware.js';
import type { IMessage } from './interfaces/IMessage.js';
import { MessageRouter } from './processor/MessageRouter.js';
import { AiInquiryCommandHandler } from './handlers/commands/AiInquiryCommandHandler.js';

export class Bot {
    // 声明 napcat 属性
    private napcat: NCWebsocket;
    private middlewareProcessor: MiddlewareProcessor;
    private messageRouter: MessageRouter;
    constructor() {
        // 声明 napcat 属性
        this.napcat = new NCWebsocket({
            protocol: config.PROTOCOL,
            host: config.HOST,
            port: config.PORT,
            accessToken: config.ACCESS_TOKEN,
            // 是否需要在触发 socket.error 时抛出错误, 默认关闭
            throwPromise: true,
            // ↓ 自动重连(可选)
            reconnection: {
                enable: true,
                attempts: 10,
                delay: 5000
            }
            // ↓ 是否开启 DEBUG 模式
        }, false)
        // 初始化中间件处理器
        this.middlewareProcessor = new MiddlewareProcessor()
            .use(new LoggingMiddleware())
            .use(new CommandParserMiddleware('/'));
        // 初始化消息路由器
        this.messageRouter = new MessageRouter();
        this.messageRouter.registerHandler(new AiInquiryCommandHandler());
        this.napcat.on('message', async (context: IMessage) => {
          const message = await this.middlewareProcessor.processMessage(context, this.napcat);
          // 路由消息
          this.messageRouter.route(message);
        })
    }
    // 启动机器人
    async start() {
        await this.napcat.connect()
        console.log('Connected to NapCat successfully!')
    }
}