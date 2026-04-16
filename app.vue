<template>
    <NuxtLayout>
        <NuxtPage></NuxtPage>
    </NuxtLayout>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { siteConfig } from '~/utils/site'

const nuxtApp = useNuxtApp()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const googleAnalyticsId = `${runtimeConfig.public.googleAnalyticsId || ''}`.trim()
const hasGoogleAnalytics = /^G-[A-Z0-9]+$/i.test(googleAnalyticsId)
const decodeSearchKeyword = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
const canonicalUrl = computed(() => {
  let canonicalPath = route.path.replace(/\/+$/, '') || '/'

  if (canonicalPath.startsWith('/en/')) {
    canonicalPath = canonicalPath.replace(/^\/en/, '') || '/'
  } else if (canonicalPath === '/en') {
    canonicalPath = '/'
  }

  const url = new URL(canonicalPath, siteConfig.domain)
  const keyword = typeof route.query.keyword === 'string' ? route.query.keyword.trim() : ''

  if (canonicalPath === '/search' && keyword) {
    url.searchParams.set('keyword', decodeSearchKeyword(keyword))
  }

  return url.toString()
})

useHead({
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
  meta: [
    {
      key: 'robots',
      name: 'robots',
      content: 'index, follow',
    },
    {
      key: 'og:type',
      property: 'og:type',
      content: 'website',
    },
    {
      key: 'og:url',
      property: 'og:url',
      content: canonicalUrl,
    },
    {
      key: 'og:site_name',
      property: 'og:site_name',
      content: siteConfig.name,
    },
    {
      key: 'twitter:card',
      name: 'twitter:card',
      content: 'summary',
    },
  ],
})

if (hasGoogleAnalytics) {
  useHead({
    script: [
      {
        key: 'google-analytics-loader',
        src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`,
        async: true,
      },
      {
        key: 'google-analytics-init',
        children: [
          'window.dataLayer = window.dataLayer || [];',
          'function gtag(){dataLayer.push(arguments);}',
          "gtag('js', new Date());",
          `gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });`,
        ].join(''),
      },
    ],
  })
}

for(const [key,component] of Object.entries(ElementPlusIconsVue)){
  nuxtApp.vueApp.component(key,component)
}

</script>
<style>
body{
    background-color: #fcfcfd;
    padding: 0;
    margin: 0 auto;
}

h1,h2,h3,h4,h5,h6{
    margin: 0;
    padding: 0;
}
</style>
