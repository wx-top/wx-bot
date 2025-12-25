import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import OpenAI from 'openai';
import RedisUtils from '../utils/RedisUtils.js';

export default class ChatService {
    private subLogger = logger.getSubLogger({ name: "chatStore", type: 'pretty' });
    private openMap = new Map<string, OpenAI>();

    constructor() {
        if (config.OPENAI_DOUBAO_API_URL && config.OPENAI_DOUBAO_API_KEY) {
            this.openMap.set(config.OPENAI_DOUBAO_API_MODEL, new OpenAI({
                baseURL: config.OPENAI_DOUBAO_API_URL,
                apiKey: config.OPENAI_DOUBAO_API_KEY,
            }));
        }
        if (config.OPENAI_DEEPSEEK_API_URL && config.OPENAI_DEEPSEEK_API_KEY) {
            this.openMap.set(config.OPENAI_DEEPSEEK_API_MODEL, new OpenAI({
                baseURL: config.OPENAI_DEEPSEEK_API_URL,
                apiKey: config.OPENAI_DEEPSEEK_API_KEY,
            }));
        }
    }

    /**
     * 聊天
     */
    async chat(sessionId: string, message: IMessage) {
        // 获取历史
        let content = '';
        let msg = message.args?.join(',') || ''
        const history = await this.getMessages(sessionId);
        let model = await this.getModel(sessionId);
        this.subLogger.info(`History: ${JSON.stringify(history)}`);
        let prompt = await RedisUtils.getPrompt(sessionId);
        if (!prompt) {
            prompt = config.OPENAI_API_PROMPT || ''
        }
        if (!model || !this.openMap.has(model)) {
            // 如没有模型，默认使用豆包
            model = config.OPENAI_DOUBAO_API_MODEL
        }
        if (model === config.OPENAI_DOUBAO_API_MODEL) {
            content = await this.aiDoubao(message, history, prompt);
        } else if (model === config.OPENAI_DEEPSEEK_API_MODEL) {
            content = await this.aiDeepseek(msg, history, prompt);
        }
        if (content) {
            await this.addMessage(sessionId, { role: "user", content: msg });
            await this.addMessage(sessionId, { role: "assistant", content: content });
        } else {
            content = '我勒个逗，卡了！'
        }
        return content
    }

    async aiDoubao(message: IMessage, history: IChatMessage[],  prompt: string) {
        let content = message.message.filter((item: any) =>  item.type !== 'text')
        .map((item: any) => {
             if (item.type === 'image') {
                return {
                    "type": "image_url",
                    "image_url": {
                        "url": item.data.url
                    },
                }
            }
        })
        // 插入第一个
        content.unshift({"type": "text", "text": message.args?.join(',') || ''})
        this.subLogger.info(`Content: ${JSON.stringify(content)}`);
        const response = await this.openMap.get(config.OPENAI_DOUBAO_API_MODEL)?.chat.completions.create({
            messages: [
                {role: "system", content: prompt},
                ...history,
                { role: "user", content: content }
            ],
            model: config.OPENAI_DOUBAO_API_MODEL,
        });
        return response?.choices?.[0]?.message?.content || '';
    }

    async aiDeepseek(msg: string, history: IChatMessage[],  prompt: string) {
        const response = await this.openMap.get(config.OPENAI_DEEPSEEK_API_MODEL)?.chat.completions.create({
            messages: [
                {role: "system", content: prompt},
                ...history,
                { role: "user", content: msg }
            ],
            model: config.OPENAI_DEEPSEEK_API_MODEL,
        });
        return response?.choices?.[0]?.message?.content || '';
    }

    /** 
     * 获取模型
     */
    async getModel(sessionId: string) {
        return await RedisUtils.getModel(sessionId);
    }

     /**
      * 设置模型
      */
    async setModel(sessionId: string, model: string) {
        await RedisUtils.setModel(sessionId, model);
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