type RateLimitEntry = {
    count: number
    resetAt: number
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 40

const globalRateLimitStore = globalThis as typeof globalThis & {
    __NETDISK_RATE_LIMIT_STORE__?: Map<string, RateLimitEntry>
}

if (!globalRateLimitStore.__NETDISK_RATE_LIMIT_STORE__) {
    globalRateLimitStore.__NETDISK_RATE_LIMIT_STORE__ = new Map<string, RateLimitEntry>()
}

const rateLimitStore = globalRateLimitStore.__NETDISK_RATE_LIMIT_STORE__

const getClientIp = (event: Parameters<typeof defineEventHandler>[0]) => {
    const cfIp = getHeader(event, 'cf-connecting-ip')
    if (cfIp) {
        return cfIp.trim()
    }

    const forwardedFor = getHeader(event, 'x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

export default defineEventHandler((event) => {
    const path = getRequestURL(event).pathname

    if (path !== '/api/sources/hh/search') {
        return
    }

    const now = Date.now()
    const key = `${getClientIp(event)}:${path}`
    const current = rateLimitStore.get(key)

    if (!current || current.resetAt <= now) {
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_MS,
        })
        return
    }

    current.count += 1
    rateLimitStore.set(key, current)

    if (current.count <= RATE_LIMIT_MAX_REQUESTS) {
        return
    }

    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    setHeader(event, 'Retry-After', String(retryAfter))
    setResponseStatus(event, 429, 'Too Many Requests')

    return {
        code: 429,
        msg: '请求过于频繁，请 1 分钟后再试',
    }
})
