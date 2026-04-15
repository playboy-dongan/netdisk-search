<script setup lang="ts">
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '用户协议',
  description: `${siteConfig.name} 的用户协议页面。`,
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-800">
    <div class="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">用户协议</h1>
      <div class="mt-6 space-y-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
        <p>1. 访问和使用本站，即视为你同意仅将本站用于个人学习、信息检索与公益交流用途。</p>
        <p>2. 你不得利用本站从事违法违规活动，不得通过本站传播、复制、售卖、引流、批量采集或商业化使用相关资源。</p>
        <p>3. 本站保留在不另行通知的情况下，对页面、搜索接口、访问频率限制与服务内容进行调整的权利。</p>
        <p>4. 若你频繁调用接口、恶意爬取、攻击或影响站点稳定性，本站有权限制访问或直接封禁相关请求。</p>
        <p>5. 第三方搜索结果与跳转目标不受本站控制，使用风险由访问者自行判断并承担。</p>
      </div>
    </div>
  </div>
</template>
