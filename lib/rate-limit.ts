import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let _redis: Redis | null = null
function getRedis() {
  if (!_redis) _redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  return _redis
}

const DAILY_LIMITS = { free: 3, pro: 10, accelerator: 50 } as const

export async function checkRateLimit(
  userId: string,
  plan: 'free' | 'pro' | 'accelerator'
): Promise<{ allowed: boolean; remaining: number }> {
  const ratelimit = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.fixedWindow(DAILY_LIMITS[plan], '1 d'),
    prefix: 'applications',
  })
  const { success, remaining } = await ratelimit.limit(userId)
  return { allowed: success, remaining }
}
