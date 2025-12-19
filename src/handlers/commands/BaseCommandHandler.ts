import type { IMessage } from '../../interfaces/IMessage.js'
import type { IMessageHandler } from '../../interfaces/IMessageHandler.js'

export abstract class BaseCommandHandler implements IMessageHandler {
  name: string = 'BaseCommandHandler'
  description?: string
  
  abstract canHandle(message: IMessage): boolean
  abstract handle(message: IMessage): Promise<IMessage | void>
  
  protected isCommand(message: IMessage): boolean {
    return !!message.isCommand
  }
  
  protected getCommand(message: IMessage): string | undefined {
    return message.command
  }
  
  protected getArgs(message: IMessage): string[] {
    return message.args || []
  }
}