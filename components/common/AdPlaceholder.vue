<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '广告位',
  },
  description: {
    type: String,
    default: '后续可替换为 Google AdSense、联盟广告或图片广告代码。',
  },
})
</script>

<template>
  <div class="rounded-2xl border border-dashed border-amber-400 bg-amber-50/80 p-4 text-center dark:border-amber-300 dark:bg-gray-700/40">
    <p class="text-sm font-semibold text-amber-700 dark:text-amber-200">{{ title }}</p>
    <p class="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-200">{{ description }}</p>
    <div class="mt-3 rounded-xl bg-white/80 px-4 py-5 text-xs font-medium tracking-[0.2em] text-slate-500 dark:bg-gray-800 dark:text-slate-300">
      AD PLACEHOLDER
    </div>
  </div>
</template>
