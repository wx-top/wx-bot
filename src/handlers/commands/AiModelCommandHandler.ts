import { Structs } from 'node-napcat-ts'
import type { Bot } from '../../bot.js'
import { BaseCommandHandler } from './BaseCommandHandler.js'
import RedisUtils from '../../utils/RedisUtils.js'
import { config } from '../../config/index.js'

export class AiModelCommandHandler extends BaseCommandHandler {
  name: string = 'AiModelCommandHandler'
  description?: string = '查看与设置AI模型'

  private getAvailableModels(): string[] {
    const models: string[] = []
    if (config.OPENAI_DOUBAO_API_URL && config.OPENAI_DOUBAO_API_KEY) {
      models.push(config.OPENAI_DOUBAO_API_MODEL)
    }
    if (config.OPENAI_DEEPSEEK_API_URL && config.OPENAI_DEEPSEEK_API_KEY) {
      models.push(config.OPENAI_DEEPSEEK_API_MODEL)
    }
    return models
  }

  canHandle(message: IMessage): boolean {
    return this.isCommand(message) && this.getCommand(message) === 'model'
  }

  async handle(message: IMessage, bot: Bot): Promise<IMessage | void> {
    const napcat = bot.getNapcat()
    if (message.message_type === 'private') {
      napcat?.send_private_msg({
        user_id: message.user_id,
        message: [Structs.text('请先加入群聊，再咨询AI')],
      })
      return
    }
    if (message.message_type === 'group') {
      const sessionId = `${message.group_id}:${message.user_id}`
      const args = this.getArgs(message)
      if (args.length === 0) {
        const cur = await RedisUtils.getModel(sessionId)
        const current = cur || '暂无配置'
        const text = [
          `当前模型: ${current}`,
          `用法:`,
          `/model list        查看可用模型`,
          `/model set <模型>  设置当前模型`,
          `/model show        查看当前已设置模型`,
        ].join('\n')
        napcat?.send_group_msg({
          group_id: message.group_id,
          message: [Structs.text(text)],
        })
        return
      }
      const sub = args[0]
      if (sub === 'list') {
        const models = this.getAvailableModels()
        const text = ['可用模型:', ...(models.length ? models.map(m => `- ${m}`) : ['- 暂无可用模型'])].join('\n')
        napcat?.send_group_msg({
          group_id: message.group_id,
          message: [Structs.text(text)],
        })
        return
      }
      if (sub === 'set') {
        if (args.length < 2) {
          napcat?.send_group_msg({
            group_id: message.group_id,
            message: [Structs.text('请提供模型名称，如 /model set deepseek-chat')],
          })
          return
        }
        const model = args[1]
        const models = this.getAvailableModels()
        if (model && !models.includes(model)) {
          const tip = ['不支持的模型', '可用模型:', ...models.map(m => `- ${m}`)].join('\n')
          napcat?.send_group_msg({
            group_id: message.group_id,
            message: [Structs.text(tip)],
          })
          return
        }
        await RedisUtils.setModel(sessionId, model!)
        napcat?.send_group_msg({
          group_id: message.group_id,
          message: [Structs.text(`模型已设置为: ${model}`)],
        })
        return
      }
      if (sub === 'show') {
        const cur = await RedisUtils.getModel(sessionId)
        const current = cur || '暂无配置'
        napcat?.send_group_msg({
          group_id: message.group_id,
          message: [Structs.text(`当前模型: ${current}`)],
        })
        return
      }
    }
  }
}
