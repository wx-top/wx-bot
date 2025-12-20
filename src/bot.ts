import { NCWebsocket } from 'node-napcat-ts'
import { config } from './config/index.js'
import { MiddlewareProcessor } from './processor/MiddlewareProcessor.js';
import { LoggingMiddleware } from './middleware/LoggingMiddleware.js';
import { CommandParserMiddleware } from './middleware/CommandParserMiddleware.js';
import { MessageRouter } from './processor/MessageRouter.js';
import type { EnvConfig } from './config/schema.js';
import { logger } from './utils/logger.js';


export class Bot {

    private napcat: NCWebsocket;
    private middlewareProcessor: MiddlewareProcessor;
    private messageRouter: MessageRouter;
    private config: EnvConfig;

    constructor() {
        // 声明 napcat 属性
        this.config = config;
        this.napcat = new NCWebsocket({
            protocol: this.config.PROTOCOL,
            host: this.config.HOST,
            port: this.config.PORT,
            accessToken: this.config.ACCESS_TOKEN,
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
    }

    /**
     * 注册中间件
     * @param middleware 中间件
     */
    registerMiddleware(middleware: IMiddleware) {
        this.middlewareProcessor.use(middleware)
    }

    /**
     * 注册中间件
     * @param handler 消息处理器
     */
    registerHandler(handler: IMessageHandler) {
        this.messageRouter.registerHandler(handler)
    }

    
    /**
     * 获取 napcat 实例
     * @returns napcat 实例
     */
    getNapcat() {
        return this.napcat
    }

    /**
     * 停止机器人
     */
    stop() {
        this.napcat.disconnect()
        logger.info('Disconnected from NapCat successfully!')
    }

    /**
     * 启动机器人
     */
    async start() {
        this.napcat.on('message', async (context: IMessage) => {
            const message = await this.middlewareProcessor.processMessage(context, this);
            // 路由消息
            this.messageRouter.route(message, this);
        })
        await this.napcat.connect()
        logger.info('Connected to NapCat successfully!')
    }
}