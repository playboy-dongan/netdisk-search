<script setup lang="ts">
import { siteConfig, siteDisclaimerText } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '免责声明',
  description: `${siteConfig.name} 的免责声明页面。`,
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-800">
    <div class="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">免责声明</h1>
      <div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-8 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
        {{ siteDisclaimerText }}
      </div>
      <div class="mt-6 space-y-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
        <p>1. 本站仅提供基于公开网络信息的检索、跳转与页面展示服务，不储存、不上传、不复制任何搜索结果对应的文件。</p>
        <p>2. 搜索结果均来自第三方公开资源接口或公开页面，本站无法保证其合法性、准确性、完整性、时效性与可用性。</p>
        <p>3. 用户因访问、下载、传播或使用第三方内容而产生的风险、责任与纠纷，均由用户自行承担。</p>
        <p>4. 如第三方资源侵犯你的合法权益，请按照侵权投诉页面要求提交材料，本站将在核实后尽快处理。</p>
      </div>
    </div>
  </div>
</template>
