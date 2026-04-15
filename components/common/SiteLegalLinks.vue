<script setup lang="ts">
import { legalLinks } from '~/utils/site'
</script>

<template>
  <nav class="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
    <template v-for="(item, index) in legalLinks" :key="item.to">
      <NuxtLink class="hover:text-blue-600" :to="item.to">{{ item.label }}</NuxtLink>
      <span v-if="index < legalLinks.length - 1" class="text-slate-300 dark:text-slate-500">|</span>
    </template>
  </nav>
</template>
