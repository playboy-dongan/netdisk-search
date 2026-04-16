<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { BadgeVariants } from '.'
import { cn } from '@/lib/utils'
import { badgeVariants } from '.'

const props = withDefaults(defineProps<{
  variant?: BadgeVariants['variant']
  as?: string
  class?: HTMLAttributes['class']
}>(), {
  as: 'span',
})
</script>

<template>
  <component :is="as" data-slot="badge" :class="cn(badgeVariants({ variant }), props.class)">
    <slot />
  </component>
</template>
