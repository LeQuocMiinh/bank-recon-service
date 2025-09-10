import Redis from "ioredis";

let redis: Redis | null = null;

export function createRedisService(url: string): void {
  if (redis === null) {
    redis = new Redis(url);
    redis.on("error", (err) => {
      console.error("[Redis ERROR]", err);
    });

    console.info("Redis initialized");
  } else {
    console.error("Redis has already been initialized");
  }
}

export function redisClient(): Redis {
  if (redis === null) {
    throw new Error("Redis is not initialized");
  }
  return redis;
}

export async function getCache(key: string): Promise<string | null> {
  const client = redisClient();
  return await client.get(key);
}

export async function addCacheExpire(
  key: string,
  value: string | object,
  ttl: number = 3600,
): Promise<"OK"> {
  const client = redisClient();
  const cacheValue = typeof value === "string" ? value : JSON.stringify(value);

  return await client.setex(key, ttl, cacheValue);
}

export async function deleteCache(key: string): Promise<number> {
  const client = redisClient();
  return await client.del(key);
}
