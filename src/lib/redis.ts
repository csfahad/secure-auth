import Redis from "ioredis";

const redisUri = process.env.REDIS_URI || "redis://localhost:6379";

export const redis = new Redis(redisUri, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

redis.on("connect", () => console.log(`Connected to Redis`));
redis.on("error", (err) => console.error(`Redis error:`, err));
