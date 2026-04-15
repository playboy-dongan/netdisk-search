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
        如需提交内容纠错、广告合作建议或其他站务问题，可通过以下邮箱联系站长。
      </p>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm font-semibold text-slate-900 dark:text-white">联系邮箱</p>
        <p class="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">{{ siteConfig.contactEmail }}</p>
      </div>
    </div>
  </div>
</template>
