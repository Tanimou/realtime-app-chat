/**
 * This file contains a helper function `fetchRedis` that sends Redis commands to an Upstash Redis instance
 * using the Redis REST API. The function takes a Redis command and its arguments as parameters, and returns
 * the result of the command as a Promise. The Redis instance URL and access token are read from environment
 * variables `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, respectively.
 */
const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashRedisRestToken= process.env.UPSTASH_REDIS_REST_TOKEN

type Commands = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(
    command: Commands,
    ...args: (string | number)[]) {
    const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join("/")}`
    const response = await fetch(
    commandUrl,
      {
        headers: {
          Authorization: `Bearer ${upstashRedisRestToken}`,
        },
        cache: "no-store",
        });
    
    if (!response.ok) {
            throw new Error(`Error executing Redis commands: ${response.statusText}`)
    }
    const data= await response.json()
    return data.result
    }
