<script setup lang="ts">
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '隐私政策',
  description: `${siteConfig.name} 的隐私政策说明页面。`,
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-800">
    <div class="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">隐私政策</h1>
      <div class="mt-6 space-y-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
        <p>1. 本站无需注册即可访问，默认不会主动收集身份证、银行卡、真实姓名等敏感身份信息。</p>
        <p>2. 为保证网站正常运行，服务器可能记录必要的访问日志，例如访问时间、请求路径、IP 地址、浏览器类型、状态码等技术信息。</p>
        <p>3. 搜索结果来自第三方公开接口。当你点击结果跳转到第三方页面后，该页面的数据处理和隐私规则由第三方自行负责。</p>
        <p>4. 为保障网站稳定性，本站会使用基础限流、缓存与安全响应头等技术措施，这些措施不会用于识别你的真实身份。</p>
        <p>5. 本站可能使用 Google Analytics 等网站统计工具，用于了解访问量、热门页面和常见设备类型等汇总信息。这类服务可能通过 Cookie 或类似技术收集非直接身份信息。</p>
        <p>6. 如后续接入广告服务，广告平台可能依据其自身规则使用 Cookie 或类似技术；届时本站会再补充相应说明。</p>
        <p>7. 如你对本站的隐私处理有疑问，请通过侵权投诉或联系页面中的邮箱与站长联系。</p>
      </div>
    </div>
  </div>
</template>
