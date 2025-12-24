import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import OpenAI from 'openai';
import RedisUtils from '../utils/RedisUtils.js';

export default class ChatService {
    private subLogger = logger.getSubLogger({ name: "chatStore", type: 'pretty' });
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            baseURL: config.OPENAI_API_URL,
            apiKey: config.OPENAI_API_KEY,
        });
    }

    /**
     * 聊天
     */
    async chat(sessionId: string, message: string) {
        // 获取历史
        const history = await this.getMessages(sessionId);
        this.subLogger.info(`History: ${JSON.stringify(history)}`);
        let prompt = await RedisUtils.getPrompt(sessionId);
        if (!prompt) {
            prompt = config.OPENAI_API_PROMPT || ''
        }
        const response = await this.openai.chat.completions.create({
            messages: [
                {role: "system", content: prompt},
                ...history,
                { role: "user", content: message }
            ],
            model: config.OPENAI_API_MODEL,
        });
        let content = response.choices[0]?.message?.content;
        if (content) {
            await this.addMessage(sessionId, { role: "user", content: message });
            await this.addMessage(sessionId, { role: "assistant", content: content });
        } else {
            content = '我勒个逗，卡了！'
        }
        return content
    }

    /**
     * 添加消息
     */
    async addMessage(sessionId: string, message: IChatMessage) {
        await RedisUtils.addMessage(sessionId, message);
    }

    /**
     * 清空消息
     */
    async clearMessages(sessionId: string) {
        await RedisUtils.clearMessages(sessionId);
    }

    /**
     * 获取最近的 N 条消息
     */
    async getMessages(sessionId: string, n: number = 20): Promise<IChatMessage[]> {
        return await RedisUtils.getMessages(sessionId, n);
    }
}