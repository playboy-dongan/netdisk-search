<script setup lang="ts">
import { siteConfig, siteDisclaimerText } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '关于网站',
  description: `了解 ${siteConfig.name} 的站点定位、服务范围和使用说明。`,
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-800">
    <div class="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">关于网站</h1>
      <p class="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        {{ siteConfig.name }} 是一个公开可访问的网盘资源搜索导航站点，页面仅对网络公开资源做聚合展示，帮助用户更快找到阿里云盘、百度网盘、夸克网盘、迅雷网盘等公开入口。
      </p>
      <p class="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        本站不提供文件上传、下载托管、云盘存储、账号售卖等服务，搜索结果和跳转目标均来自第三方公开网络资源，结果内容及可用性会随第三方服务状态变化。
      </p>

      <div class="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
        {{ siteDisclaimerText }}
      </div>
    </div>
  </div>
</template>
