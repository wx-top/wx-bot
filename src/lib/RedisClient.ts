import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { logger } from "../utils/logger.js";
import { config } from "../config/index.js";

class RedisClient {
    private static instance: RedisClientType | null = null;
    private static isConnected = false;
    private static subLogger = logger.getSubLogger({ name: "RedisClient", type: 'pretty' });

    static async getInstance(): Promise<RedisClientType> {
        if (!RedisClient.instance) {
            RedisClient.instance = createClient({
                url: config.REDIS_URL,
            });
            
            RedisClient.instance.on("error", (err) => {
                RedisClient.subLogger.error(`Redis error: ${err}`);
            });
            
            RedisClient.instance.on("connect", () => {
                RedisClient.subLogger.info("Connecting to Redis");
            });
            
            RedisClient.instance.on("ready", () => {
                RedisClient.subLogger.info("Redis client ready");
            });
        }

        if (!RedisClient.isConnected) {
            await RedisClient.instance.connect();
            RedisClient.isConnected = true;
            RedisClient.subLogger.info("Connected to Redis");
        }

        return RedisClient.instance;
    }

    static async disconnect(): Promise<void> {
        if (RedisClient.instance && RedisClient.isConnected) {
            await RedisClient.instance.quit();
            RedisClient.isConnected = false;
            RedisClient.subLogger.info("Disconnected from Redis");
        }
    }
}

export default RedisClient;