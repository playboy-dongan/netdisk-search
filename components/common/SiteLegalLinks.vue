<script setup lang="ts">
import { legalLinks } from '~/utils/site'
</script>

<template>
  <nav class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
    <template v-for="(item, index) in legalLinks" :key="item.to">
      <NuxtLink
        class="rounded px-1 underline decoration-2 underline-offset-4 transition hover:text-red-600 dark:hover:text-yellow-200"
        :to="item.to"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-if="index < legalLinks.length - 1" class="text-amber-400 dark:text-amber-500">|</span>
    </template>
  </nav>
</template>
