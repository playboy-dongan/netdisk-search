<script setup lang="ts">
import { siteConfig, siteDisclaimerText } from '~/utils/site'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-200 bg-white/90 px-4 py-8 dark:border-gray-700 dark:bg-gray-900">
    <div class="mx-auto flex max-w-[1240px] flex-col items-center gap-4 text-center">
      <SiteLegalLinks />
      <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
        {{ siteDisclaimerText }}
      </p>
      <p class="text-xs text-slate-400 dark:text-slate-500">
        © {{ currentYear }} {{ siteConfig.name }}
      </p>
    </div>
  </footer>
</template>
