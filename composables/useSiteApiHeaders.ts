const SITE_TOKEN_COOKIE = 'wpss_token'

const readBrowserCookie = (name: string) => {
  if (typeof document === 'undefined') {
    return ''
  }

  const prefix = `${name}=`
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(prefix))

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : ''
}

export const useSiteApiHeaders = () => {
  const siteToken = useCookie(SITE_TOKEN_COOKIE)

  return () => {
    const token = siteToken.value || readBrowserCookie(SITE_TOKEN_COOKIE)

    if (!token) {
      return {}
    }

    return {
      'x-site-token': token,
    }
  }
}
