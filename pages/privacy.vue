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
        <p>1. 本站默认不会要求用户注册，也不会主动收集你的身份证、银行卡、真实姓名等敏感信息。</p>
        <p>2. 为了保证网站正常运行，服务器可能会记录基础访问日志，例如访问时间、IP 地址、浏览器类型、访问页面等技术信息。</p>
        <p>3. 搜索结果来自第三方 API。当你点击搜索结果跳转到第三方页面后，该页面的数据处理方式由第三方自行负责。</p>
        <p>4. 当你后续接入 Google AdSense 或其他广告平台后，广告服务商可能会使用 Cookie 或类似技术进行投放与统计。接入广告前，请根据平台要求补充更完整的隐私条款。</p>
        <p>5. 如果你希望删除日志、反馈问题或提出隐私相关请求，请通过联系方式页面与站长联系。</p>
      </div>
    </div>
  </div>
</template>
