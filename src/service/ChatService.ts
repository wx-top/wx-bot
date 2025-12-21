import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import OpenAI from 'openai';

export default class ChatService {
    private redisClient: RedisClientType;
    private subLogger = logger.getSubLogger({ name: "chatStore", type: 'pretty' });
    private defaultTTL = 7 * 24 * 3600; // 7 days expiration time
    private openai: OpenAI;
    private defaultModel = "deepseek-chat";
    private defaultSystemPrompt = "你是一个‘社会人’，出口成脏，但至少刀子嘴豆腐心，嘲讽之后还是会帮你解决问题，回复的内容不要以markdown原始格式";

    constructor() {
        this.openai = new OpenAI({
            baseURL: config.OPENAI_API_URL,
            apiKey: config.OPENAI_API_KEY,
        });
        this.redisClient = createClient(
            { url: config.REDIS_URL }
        );
        this.redisClient.connect();

        this.redisClient.on('error', (err) => this.subLogger.error('Redis Client Error', err));
    }

    /**
     * 聊天
     */
    async chat(sessionId: string, message: string) {
        // 获取历史
        const history = await this.getMessages(sessionId);
        this.subLogger.info(`History: ${JSON.stringify(history)}`);
        const response = await this.openai.chat.completions.create({
            messages: [
                {role: "system", content: this.defaultSystemPrompt},
                ...history,
                { role: "user", content: message }
            ],
            model: this.defaultModel,
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
        const messageKey = `chat:${sessionId}:messages`;
        await this.redisClient.lPush(messageKey, JSON.stringify(message));
        await this.redisClient.expire(messageKey, this.defaultTTL);
    }

    /**
     * 清空消息
     */
    async clearMessages(sessionId: string) {
        const messageKey = `chat:${sessionId}:messages`;
        await this.redisClient.del(messageKey);
    }

    /**
     * 获取最近的 N 条消息
     */
    async getMessages(sessionId: string, n: number = 20): Promise<IChatMessage[]> {
        const messageKey = `chat:${sessionId}:messages`;
        const messages = await this.redisClient.lRange(messageKey, 0, n - 1);
        return messages.map((message) => JSON.parse(message)).reverse();
    }
}