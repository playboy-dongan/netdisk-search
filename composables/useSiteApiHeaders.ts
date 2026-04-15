export const useSiteApiHeaders = () => {
  const siteToken = useCookie('wpss_token')

  return () => {
    if (!siteToken.value) {
      return {}
    }

    return {
      'x-site-token': siteToken.value,
    }
  }
}
