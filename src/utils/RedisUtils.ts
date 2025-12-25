import type { RedisClientType } from "redis";
import RedisClient from "../lib/RedisClient.js";
import { logger } from "./logger.js";

class RedisUtils {
    private static subLogger = logger.getSubLogger({ name: "RedisUtils", type: 'pretty' });
    private static defaultTTL = 7 * 24 * 3600; // 7 days expiration time

    /**
     * Get Redis client instance
     */
    static async getClient(): Promise<RedisClientType> {
        return await RedisClient.getInstance();
    }

    /**
     * Set the model for a session 不过期
     */
    static async setModel(sessionId: string, model: string): Promise<void> {
        try {
            const client = await this.getClient();
            const modelKey = `chat:${sessionId}:model`;
            await client.set(modelKey, model);
        } catch (error) {
            this.subLogger.error(`Failed to set model for session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Get the model for a session
     */
    static async getModel(sessionId: string): Promise<string | null> {
        try {
            const client = await this.getClient();
            const modelKey = `chat:${sessionId}:model`;
            return await client.get(modelKey);
        } catch (error) {
            this.subLogger.error(`Failed to get model for session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Add a message to a session's message list
     */
    static async addMessage(sessionId: string, message: IChatMessage, ttl: number = this.defaultTTL): Promise<void> {
        try {
            const client = await this.getClient();
            const messageKey = `chat:${sessionId}:messages`;
            await client.lPush(messageKey, JSON.stringify(message));
            await client.expire(messageKey, ttl);
        } catch (error) {
            this.subLogger.error(`Failed to add message for session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Clear all messages for a session
     */
    static async clearMessages(sessionId: string): Promise<void> {
        try {
            const client = await this.getClient();
            const messageKey = `chat:${sessionId}:messages`;
            await client.del(messageKey);
        } catch (error) {
            this.subLogger.error(`Failed to clear messages for session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Get recent messages for a session
     */
    static async getMessages(sessionId: string, count: number = 20): Promise<IChatMessage[]> {
        try {
            const client = await this.getClient();
            const messageKey = `chat:${sessionId}:messages`;
            const messages = await client.lRange(messageKey, 0, count - 1);
            return messages.map((message) => JSON.parse(message)).reverse();
        } catch (error) {
            this.subLogger.error(`Failed to get messages for session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Set a key-value pair with TTL
     */
    static async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
        try {
            const client = await this.getClient();
            await client.set(key, value, { EX: ttl });
        } catch (error) {
            this.subLogger.error(`Failed to set key ${key} with TTL:`, error);
            throw error;
        }
    }

    /**
     * Get a value by key
     */
    static async getValue(key: string): Promise<string | null> {
        try {
            const client = await this.getClient();
            return await client.get(key);
        } catch (error) {
            this.subLogger.error(`Failed to get value for key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Delete keys
     */
    static async deleteKeys(...keys: string[]): Promise<number> {
        try {
            const client = await this.getClient();
            return await client.del(keys);
        } catch (error) {
            this.subLogger.error(`Failed to delete keys:`, error);
            throw error;
        }
    }

    static async getPrompt(sessionId: string): Promise<string | null> {
        try {
            const client = await this.getClient();
            const promptKey = `chat:${sessionId}:prompt`;
            return await client.get(promptKey);
        } catch (error) {
            this.subLogger.error(`Failed to get prompt for session ${sessionId}:`, error);
            throw error;
        }
    }

    static async setPrompt(sessionId: string, prompt: string): Promise<void> {
        try {
            const client = await this.getClient();
            const promptKey = `chat:${sessionId}:prompt`;
            await client.set(promptKey, prompt);
        } catch (error) {
            this.subLogger.error(`Failed to set prompt for session ${sessionId}:`, error);
            throw error;
        }
    }

}

export default RedisUtils;