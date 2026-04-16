<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

defineProps({
  sources: {
    type: Object,
    default: () => {}
  },
  skeletonLoading: {
    type: Boolean,
    default: false
  },
  skeletonCount: {
    type: Number,
    default: 20
  },
  appendSkeletonCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['openLink'])

const handleOpenSourceLink = (link: string) => {
  emit('openLink', link)
}

const formatDiskType = (type: string) => {
  switch (type) {
    case 'ALY':
      return '阿里云盘'
    case 'BDY':
      return '百度网盘'
    case 'QUARK':
      return '夸克网盘'
    case 'XUNLEI':
      return '迅雷网盘'
    case 'UC':
      return 'UC 网盘'
    case 'TIANYI':
      return '天翼云盘'
    case 'PIKPAK':
      return 'PikPak'
    case '115':
      return '115 网盘'
    case '123':
      return '123 云盘'
    case 'MAGNET':
      return '磁力链接'
    case 'MOBILE':
      return '移动云盘'
    default:
      return '其他来源'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div v-if="skeletonLoading" class="flex min-w-0 flex-col gap-3">
    <Card v-for="i in skeletonCount" :key="`skeleton-${i}`" class="py-0">
      <CardContent class="p-4">
        <div class="flex items-center gap-2">
          <Skeleton class="h-5 w-5 rounded-[6px]" />
          <Skeleton class="h-4 w-32" />
        </div>
        <div class="mt-4 space-y-2">
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-11/12" />
        </div>
      </CardContent>
    </Card>
  </div>

  <div v-else class="flex min-w-0 flex-col gap-3">
      <Card
        v-for="(item, i) in sources?.list"
        :key="`${item.link || item.doc_id || 'item'}-${i}`"
        class="min-w-0 cursor-pointer py-0 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-gray-700"
        @click="handleOpenSourceLink(item.link)"
      >
        <CardContent class="p-4">
          <div class="flex min-w-0 flex-row gap-2 items-center">
            <img class="w-[20px]" v-if="item.disk_type === 'ALY'" src="@/assets/netdisk/aliyun.png" alt="aliyun">
            <img class="w-[20px]" v-if="item.disk_type === 'QUARK'" src="@/assets/netdisk/quark.png" alt="quark">
            <img class="w-[20px]" v-if="item.disk_type === 'BDY'" src="@/assets/netdisk/baidu.png" alt="baidu">
            <img class="w-[20px]" v-if="item.disk_type === 'XUNLEI'" src="@/assets/netdisk/xunlei.png" alt="xunlei">
            <p class="min-w-0 flex-1 truncate text-[14px] font-inter font-[600] dark:text-white" v-html="item.disk_name"></p>
          </div>

          <div class="py-[12px]">
            <p class="min-w-0 text-[12px] text-slate-400 dark:text-slate-200 truncate-3-lines" v-html="item.files"></p>
          </div>

          <div class="flex min-w-0 flex-col items-start gap-2 text-[12px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-row items-center gap-2 flex-wrap">
              <Badge v-if="item.disk_type" class="rounded-[6px] bg-blue-500 text-white hover:bg-blue-500">
                {{ formatDiskType(item.disk_type) }}
              </Badge>
              <Badge v-if="item.disk_pass" class="rounded-[6px] bg-violet-500 text-white hover:bg-violet-500">
                {{ item.disk_pass }}
              </Badge>
            </div>
            <div class="shrink-0">
              <span v-if="item.update_time" class="text-slate-600 px-[6px] py-[2px] rounded">
                {{ formatDate(item.update_time) }}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card v-for="i in appendSkeletonCount" :key="`append-skeleton-${i}`" class="py-0">
        <CardContent class="p-4">
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-5 rounded-[6px]" />
            <Skeleton class="h-4 w-32" />
          </div>
          <div class="mt-4 space-y-2">
            <Skeleton class="h-3 w-full" />
            <Skeleton class="h-3 w-11/12" />
          </div>
        </CardContent>
      </Card>
  </div>
</template>

<style>
em {
  color: blue;
  margin: 0 2px;
}

.dark em {
  color: deepskyblue;
}
</style>

<style scoped>
.truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
