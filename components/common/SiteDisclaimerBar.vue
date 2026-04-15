<script setup lang="ts">
import { siteDisclaimerText } from '~/utils/site'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
    :class="compact ? 'px-4 py-3 text-xs leading-6' : 'px-5 py-4 text-sm leading-7'"
  >
    {{ siteDisclaimerText }}
  </div>
</template>
