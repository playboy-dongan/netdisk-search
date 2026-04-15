<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1">
      <slot></slot>
    </div>
    <SiteFooter v-if="!isHomePage" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isHomePage = computed(() => route.path === '/')
</script>
