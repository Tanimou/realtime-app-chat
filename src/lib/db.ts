import { Redis } from '@upstash/redis'

function getRedisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || url.length === 0) {
    throw new Error('Missing Redis_CLIENT_ID')
  }

  if (!token || token.length === 0) {
    throw new Error('Missing Redis_CLIENT_SECRET')
  }

  return { url, token }
}
export const database = new Redis({
  url: getRedisCredentials().url,
  token:
    getRedisCredentials().token
});

// export const database = Redis.fromEnv()