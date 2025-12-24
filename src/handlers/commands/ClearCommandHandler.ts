import { Structs, type NCWebsocket } from "node-napcat-ts";
import type { Bot } from "../../bot.js";
import { BaseCommandHandler } from "./BaseCommandHandler.js";
import ChatService from "../../service/ChatService.js";

export class ClearCommandHandler extends BaseCommandHandler {

    napcat?: NCWebsocket;
    chatService: ChatService = new ChatService();

    canHandle(message: IMessage): boolean {
        return this.isCommand(message) && this.getCommand(message) === 'clear'
    }

    async handle(message: IMessage, bot: Bot) {
        this.napcat = bot.getNapcat();
        if (message.message_type === 'private') {
            await this.handlePrivateMessage(message);
        } else if (message.message_type === 'group') {
            await this.handleGroupMessage(message);
        }
    }

    async handleGroupMessage(message: IMessage) {
        const sessionId = `${message.group_id}:${message.user_id}`
        this.chatService.clearMessages(sessionId);
        this.napcat?.send_group_msg({
            group_id: message.group_id,
            message: [Structs.text('已清空历史记录')],
        })


    }

    async handlePrivateMessage(message: IMessage) {
        this.napcat?.send_private_msg({
            user_id: message.user_id,
            message: [Structs.text('请先加入群聊，再咨询AI')],
        })
    }
}