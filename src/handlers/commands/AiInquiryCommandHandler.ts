import OpenAI from 'openai'
import { BaseCommandHandler } from './BaseCommandHandler.js'
import { Structs } from 'node-napcat-ts'
import type { Bot } from '../../bot.js'
import ChatService from '../../service/ChatService.js'

export class AiInquiryCommandHandler extends BaseCommandHandler {
    name: string = 'AiInquiryCommandHandler'
    description?: string = '处理AI咨询命令'
    chatService: ChatService = new ChatService();
    
    constructor() {
        super()
    }


    canHandle(message: IMessage): boolean {
        return this.isCommand(message) && this.getCommand(message) === 'ai'
    }

    async handle(message: IMessage, bot: Bot): Promise<IMessage | void> {
        const napcat = bot.getNapcat()
        if (message.message_type === 'private') {
            napcat?.send_private_msg({
                user_id: message.user_id,
                message: [Structs.text('请先加入群聊，再咨询AI')],
            })
        } else if (message.message_type === 'group') {
            const args = this.getArgs(message)
            if (args.length === 0) {
                napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text('请输入咨询内容')],
                })
                return;
            }
            // 获取历史记录
            const sessionId = `${message.group_id}:${message.user_id}`
            const msg = this.getArgs(message).join(',')
            this.chatService.chat(sessionId, msg)
            .then(response => {
                napcat.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text(response)],
                })
            })
            .catch(e => {
                napcat.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text(e.message)],
                })
            })
        }
    }
}
