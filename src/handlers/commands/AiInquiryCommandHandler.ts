import { BaseCommandHandler } from './BaseCommandHandler.js'
import { NCWebsocket, Structs } from 'node-napcat-ts'
import type { Bot } from '../../bot.js'
import ChatService from '../../service/ChatService.js'
import { logger } from '../../utils/logger.js'

export class AiInquiryCommandHandler extends BaseCommandHandler {
    name: string = 'AiInquiryCommandHandler'
    description?: string = '处理AI咨询命令'
    chatService: ChatService = new ChatService();
    subLogger = logger.getSubLogger({ name: this.name, type: 'pretty' })
    napcat?: NCWebsocket


    canHandle(message: IMessage): boolean {
        return this.isCommand(message) && this.getCommand(message) === 'ai'
    }

    async handle(message: IMessage, bot: Bot): Promise<IMessage | void> {
        this.napcat = bot.getNapcat()
        if (message.message_type === 'private') {
            this.handlePrivateMessage(message)
        } else if (message.message_type === 'group') {
            this.handleGroupMessage(message)
        }
    }

    async handlePrivateMessage(message: IMessage): Promise<IMessage | void> {
        this.napcat?.send_private_msg({
            user_id: message.user_id,
            message: [Structs.text('请先加入群聊，再咨询AI')],
        })
    }

    async handleGroupMessage(message: IMessage): Promise<IMessage | void> {
        const args = this.getArgs(message)
        if (args.length === 0) {
            this.napcat?.send_group_msg({
                group_id: message.group_id,
                message: [Structs.text('请输入咨询内容')],
            })
            return;
        }
        const sessionId = `${message.group_id}:${message.user_id}`
        this.chatService.chat(sessionId, message)
            .then(response => {
                this.napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text(response)],
                })
            })
            .catch(e => {
                this.subLogger.error(e)
                this.napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text(e.message)],
                })
            })
    }
}
