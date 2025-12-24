import { Structs } from 'node-napcat-ts'
import type { Bot } from '../../bot.js'
import { BaseCommandHandler } from './BaseCommandHandler.js'

export class HelpCommandHandler extends BaseCommandHandler {
  name: string = 'HelpCommandHandler'
  description?: string = '提供命令使用说明'

  canHandle(message: IMessage): boolean {
    return this.isCommand(message) && this.getCommand(message) === 'help'
  }

  async handle(message: IMessage, bot: Bot): Promise<IMessage | void> {
    const napcat = bot.getNapcat()
    const text =
      [
        '可用命令：',
        '/help 显示帮助',
        '/ai <内容> 咨询 AI',
        '/prompt            查看当前提示词',
        '/prompt set <词>   设置提示词',
        '/prompt reset      重置提示词为默认值',
        '/clear             清空当前会话历史',
      ].join('\n')
    if (message.message_type === 'private') {
      napcat?.send_private_msg({
        user_id: message.user_id,
        message: [Structs.text(text)],
      })
    } else if (message.message_type === 'group') {
      napcat?.send_group_msg({
        group_id: message.group_id,
        message: [Structs.text(text)],
      })
    }
  }
}
