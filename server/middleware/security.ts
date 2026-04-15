export default defineEventHandler((event) => {
    const path = getRequestURL(event).pathname

    setResponseHeaders(event, {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    })

    if (path.startsWith('/api/')) {
        setHeader(event, 'Cache-Control', 'no-store')
    }
})
