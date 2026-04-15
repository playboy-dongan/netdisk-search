<script setup lang="ts">
import SiteLegalLinks from '~/components/common/SiteLegalLinks.vue'
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
    class="w-full text-center text-red-600 dark:text-amber-300"
    :class="compact ? 'text-xs leading-6' : 'text-sm leading-7'"
  >
    <SiteLegalLinks />
    <p class="mt-1 font-semibold">
      {{ siteDisclaimerText }}
    </p>
  </div>
</template>
