import { z } from 'zod'

const configSchema = z.object({
  PROTOCOL: z.union([z.literal('ws'), z.literal('wss')]).default("ws"),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.string().transform(Number).default(3001),
  ACCESS_TOKEN: z.string(),
  OPENAI_API_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default(0),
})


export type EnvConfig = z.infer<typeof configSchema>

export function validateEnv(env: Record<string, string | undefined>): EnvConfig {
  try {
    return configSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => err.path.join('.'));
      throw new Error(`配置验证失败: ${missingVars.join(', ')}`);
    }
    throw error;
  }
}