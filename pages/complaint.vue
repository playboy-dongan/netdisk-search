<script setup lang="ts">
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '侵权投诉',
  description: `${siteConfig.name} 的侵权投诉说明页面。`,
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-800">
    <div class="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">侵权投诉</h1>
      <p class="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
        若你认为本站搜索结果或跳转页面涉及侵犯你的合法权益，请将投诉材料发送至以下邮箱：
      </p>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm font-semibold text-slate-900 dark:text-white">投诉邮箱</p>
        <p class="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">{{ siteConfig.contactEmail }}</p>
      </div>

      <div class="mt-6 space-y-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
        <p>请在邮件中尽量提供以下信息：</p>
        <p>1. 你的姓名或权利主体名称，以及能够证明身份或权利归属的材料。</p>
        <p>2. 你认为侵权的页面链接、搜索关键词、结果标题和具体侵权说明。</p>
        <p>3. 你的联系方式，以便本站在需要时进一步核实。</p>
        <p>4. 若你以代理人身份投诉，请同时提供授权证明材料。</p>
      </div>
    </div>
  </div>
</template>
