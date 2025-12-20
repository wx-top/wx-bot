declare global {
    type IMessage = (MessageHandler['message.private'] | MessageHandler['message.group']) & {
        command?: string;
        args?: string[];
        isCommand?: boolean;
        error?: Error;
    }
    interface IMessageHandler {
        /**
         * 检查是否能处理此消息
         */
        canHandle(message: IMessage): boolean

        /**
         * 处理消息
         */
        handle(message: IMessage, bot: Bot): Promise<IMessage | void>

        /**
         * 处理器名称（可选）
         */
        name?: string

        /**
         * 处理器描述（可选）
         */
        description?: string
    }

    interface IMiddleware {
        process(
            message: IMessage,
            bot: Bot,
            next: (message: IMessage, bot: Bot) => Promise<IMessage>
        ): Promise<IMessage>;
    }

    interface IChatMessage {
        role: "system" | "user" | "assistant";
        content: string;
    }
}

export { }
