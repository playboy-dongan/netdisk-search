<script setup lang="ts">
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '联系方式',
  description: `联系 ${siteConfig.name} 的页面。`,
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-800">
    <div class="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">联系方式</h1>
      <p class="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
        如果你需要提交侵权投诉、内容纠错、广告合作或站点建议，可以通过下面的方式联系站长。
      </p>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm font-semibold text-slate-900 dark:text-white">联系邮箱</p>
        <p class="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">{{ siteConfig.contactEmail }}</p>
      </div>

      <div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800 dark:border-amber-400 dark:bg-amber-500/10 dark:text-amber-200">
        部署前请把 <code>utils/site.ts</code> 里的邮箱和域名改成你自己的真实信息。
      </div>
    </div>
  </div>
</template>
