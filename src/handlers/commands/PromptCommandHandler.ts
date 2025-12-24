import OpenAI from 'openai'
import { BaseCommandHandler } from './BaseCommandHandler.js'
import { Structs } from 'node-napcat-ts'
import type { Bot } from '../../bot.js'
import RedisUtils from '../../utils/RedisUtils.js'
import { config } from '../../config/index.js'

export class PromptCommandHandler extends BaseCommandHandler {
    name: string = 'PromptCommandHandler'
    description?: string = '处理提示词命令'

    constructor() {
        super()
    }


    canHandle(message: IMessage): boolean {
        return this.isCommand(message) && this.getCommand(message) === 'prompt'
    }

    async handle(message: IMessage, bot: Bot): Promise<IMessage | void> {
        const napcat = bot.getNapcat()
        if (message.message_type === 'private') {
            napcat?.send_private_msg({
                user_id: message.user_id,
                message: [Structs.text('请先加入群聊，再咨询AI')],
            })
        } else if (message.message_type === 'group') {
            const sessionId = `chat:${message.group_id}:${message.user_id}:prompt`
            const args = this.getArgs(message)
            if (args.length === 0) {
                const prompt = await RedisUtils.getPrompt(sessionId)
                const promptText = `当前提示词: ${prompt || config.OPENAI_API_PROMPT}` || '未配置提示词'
                napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text(promptText)],
                })
            } else if (args.length > 0) {
                if (args[0] === 'set') {
                    if (args.length < 2) {
                        napcat?.send_group_msg({
                            group_id: message.group_id,
                            message: [Structs.text('请输入提示词')],
                        })
                        return
                    }
                    await RedisUtils.setPrompt(sessionId, args[1] as string)
                    napcat?.send_group_msg({
                        group_id: message.group_id,
                        message: [Structs.text('提示词设置成功')],
                    })
                } else if (args[0] === 'reset') {
                    await RedisUtils.setPrompt(sessionId, config.OPENAI_API_PROMPT || '')
                    napcat?.send_group_msg({
                        group_id: message.group_id,
                        message: [Structs.text('提示词重置成功')],
                    })
                }
            }
        }
    }
}
