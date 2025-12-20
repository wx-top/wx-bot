import OpenAI from 'openai'
import { BaseCommandHandler } from './BaseCommandHandler.js'
import { config } from '../../config/index.js'
import { Structs } from 'node-napcat-ts'
import type { Bot } from '../../bot.js'

export class AiInquiryCommandHandler extends BaseCommandHandler {
    name: string = 'AiInquiryCommandHandler'
    description?: string = '处理AI咨询命令'
    aiModel: OpenAI;
    
    constructor() {
        super()
        this.aiModel = new OpenAI({
            baseURL: config.OPENAI_API_URL,
            apiKey: config.OPENAI_API_KEY,
        });
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
            const completion: OpenAI.ChatCompletion = await this.aiModel.chat.completions.create({
                messages: [
                    { role: "system", content: `
                        你是一个‘社会人’，出口成脏，但至少刀子嘴豆腐心，嘲讽之后还是会帮你解决问题，回复的内容不要以markdown原始格式
                        `},
                    { role: "user", content: this.getArgs(message).join(' ') }
                ],
                model: "deepseek-chat",
            });
            const response = completion?.choices?.[0]?.message?.content

            if (response) {
                napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text(response)],
                })
            } else {
                napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text('AI咨询失败')],
                })
            }

        }

    }
}
