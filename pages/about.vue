<script setup lang="ts">
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '关于我们',
  description: `了解 ${siteConfig.name} 的站点定位、功能范围和使用说明。`,
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 dark:bg-gray-800">
    <div class="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-gray-900">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">关于我们</h1>
      <p class="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        {{ siteConfig.name }} 是一个公开可访问的网盘资源搜索网站，页面会聚合多个第三方搜索源，帮助用户更快找到阿里云盘、百度网盘、夸克网盘、迅雷网盘等资源入口。
      </p>
      <p class="mt-4 leading-8 text-slate-600 dark:text-slate-300">
        我们只提供页面展示、关键词搜索和跳转服务，不直接存储、上传、售卖任何网盘文件。搜索结果由第三方 API 返回，结果内容与可用性会随第三方服务状态变化。
      </p>
      <div class="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">适合放在这里的内容</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li>站点简介</li>
          <li>服务范围</li>
          <li>免责声明</li>
          <li>合作方式</li>
        </ul>
      </div>
    </div>
  </div>
</template>
