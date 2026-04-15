const SITE_TOKEN_COOKIE = 'wpss_token'
const SITE_TOKEN_MAX_AGE = 60 * 60 * 24 * 30

const isSameHost = (candidate: string, host: string) => {
    try {
        return new URL(candidate).host === host
    } catch {
        return false
    }
}

const getOrCreateSiteToken = (event: Parameters<typeof defineEventHandler>[0]) => {
    const current = getCookie(event, SITE_TOKEN_COOKIE)
    if (current) {
        return current
    }

    const token = crypto.randomUUID().replaceAll('-', '')
    setCookie(event, SITE_TOKEN_COOKIE, token, {
        httpOnly: false,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: SITE_TOKEN_MAX_AGE,
    })
    return token
}

export default defineEventHandler((event) => {
    const url = getRequestURL(event)
    const path = url.pathname

    if (!path.startsWith('/api/')) {
        getOrCreateSiteToken(event)
        return
    }

    if (!path.startsWith('/api/sources/')) {
        return
    }

    const userAgent = getHeader(event, 'user-agent')
    if (!userAgent) {
        setResponseStatus(event, 403, 'Forbidden')
        return {
            code: 403,
            msg: '请求被拒绝',
        }
    }

    const requestHost = url.host
    const origin = getHeader(event, 'origin')
    const referer = getHeader(event, 'referer')
    const secFetchSite = getHeader(event, 'sec-fetch-site')

    if (secFetchSite && !['same-origin', 'same-site', 'none'].includes(secFetchSite)) {
        setResponseStatus(event, 403, 'Forbidden')
        return {
            code: 403,
            msg: '请求来源无效',
        }
    }

    if (origin && !isSameHost(origin, requestHost)) {
        setResponseStatus(event, 403, 'Forbidden')
        return {
            code: 403,
            msg: '跨站请求已被拦截',
        }
    }

    if (!origin && referer && !isSameHost(referer, requestHost)) {
        setResponseStatus(event, 403, 'Forbidden')
        return {
            code: 403,
            msg: '跨站请求已被拦截',
        }
    }

    const cookieToken = getOrCreateSiteToken(event)
    const headerToken = getHeader(event, 'x-site-token')

    if (!headerToken || headerToken !== cookieToken) {
        setResponseStatus(event, 403, 'Forbidden')
        return {
            code: 403,
            msg: '请求校验失败，请刷新页面后重试',
        }
    }
})
