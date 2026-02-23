/**
 * Redis store for rooms, matchmaking queue, and session data.
 * Falls back to in-memory if REDIS_URL is not set.
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

let client: Redis | null = null;
const memory: Map<string, string> = new Map();

export function getRedis(): Redis | null {
  if (client) return client;
  if (REDIS_URL) {
    try {
      client = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 });
      return client;
    } catch {
      return null;
    }
  }
  return null;
}

export async function redisGet(key: string): Promise<string | null> {
  const r = getRedis();
  if (r) return r.get(key);
  return memory.get(key) ?? null;
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const r = getRedis();
  if (r) {
    if (ttlSeconds != null) await r.setex(key, ttlSeconds, value);
    else await r.set(key, value);
  } else {
    memory.set(key, value);
  }
}

export async function redisDel(key: string): Promise<void> {
  const r = getRedis();
  if (r) await r.del(key);
  else memory.delete(key);
}

export async function redisExists(key: string): Promise<boolean> {
  const r = getRedis();
  if (r) return (await r.exists(key)) === 1;
  return memory.has(key);
}

const ROOM_PREFIX = 'room:';
const ROOM_TTL = 60 * 60 * 2; // 2 hours

export async function saveRoom(roomId: string, data: object): Promise<void> {
  await redisSet(ROOM_PREFIX + roomId, JSON.stringify(data), ROOM_TTL);
}

export async function getRoom(roomId: string): Promise<object | null> {
  const raw = await redisGet(ROOM_PREFIX + roomId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as object;
  } catch {
    return null;
  }
}

export async function deleteRoom(roomId: string): Promise<void> {
  await redisDel(ROOM_PREFIX + roomId);
}

const QUEUE_KEY = 'matchmaking:queue';
const memoryQueue: string[] = [];

export async function addToMatchmaking(socketId: string, payload: string): Promise<void> {
  const r = getRedis();
  if (r) await r.rpush(QUEUE_KEY, payload);
  else memoryQueue.push(payload);
}

export async function popMatchmaking(): Promise<string | null> {
  const r = getRedis();
  if (r) return r.lpop(QUEUE_KEY);
  return memoryQueue.shift() ?? null;
}
