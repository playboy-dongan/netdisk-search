const GOOGLE_VERIFICATION_PATH = '/googlec528264d1624ae0b.html'
const GOOGLE_VERIFICATION_CONTENT = 'google-site-verification: googlec528264d1624ae0b.html'

export default defineEventHandler((event) => {
    const path = getRequestURL(event).pathname

    if (path !== GOOGLE_VERIFICATION_PATH) {
        return
    }

    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return GOOGLE_VERIFICATION_CONTENT
})
