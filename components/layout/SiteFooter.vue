<script setup lang="ts">
import { siteConfig } from '~/utils/site'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-200 bg-white/90 px-4 py-8 dark:border-gray-700 dark:bg-gray-900">
    <div class="mx-auto flex max-w-[1240px] flex-col items-center gap-4 text-center">
      <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-300">
        <NuxtLink class="hover:text-blue-600" to="/about">关于我们</NuxtLink>
        <NuxtLink class="hover:text-blue-600" to="/privacy">隐私政策</NuxtLink>
        <NuxtLink class="hover:text-blue-600" to="/contact">联系方式</NuxtLink>
        <a class="hover:text-blue-600" :href="siteConfig.githubUrl" target="_blank" rel="noreferrer">GitHub</a>
      </div>
      <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
        © {{ currentYear }} {{ siteConfig.name }}。本站仅提供搜索入口与页面展示，不存储、不上传网盘资源文件。
      </p>
    </div>
  </footer>
</template>
