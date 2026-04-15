<template>
    <NuxtLayout>
        <NuxtPage></NuxtPage>
    </NuxtLayout>
</template>

<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const nuxtApp = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const googleAnalyticsId = `${runtimeConfig.public.googleAnalyticsId || ''}`.trim()
const hasGoogleAnalytics = /^G-[A-Z0-9]+$/i.test(googleAnalyticsId)

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
