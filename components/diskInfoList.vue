<script setup lang="ts">
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
  <el-skeleton v-if="skeletonLoading" animated :count="skeletonCount">
    <template #template>
      <div
        class="bg-white dark:bg-gray-600 shadow p-[14px] rounded-[6px] cursor-pointer mb-3
        hover:bg-[#f5f5f5] hover:shadow-lg transition duration-300 ease-in-out"
      >
        <div class="flex flex-row gap-2 items-center">
          <el-skeleton-item variant="image" style="width: 20px; height: 20px" />
          <el-skeleton-item variant="text" style="width: 100px;" />
        </div>
        <div>
          <el-skeleton-item variant="text" style="width: 100%;" />
        </div>
        <div>
          <el-skeleton-item variant="text" style="width: 100%;" />
        </div>
      </div>
    </template>
  </el-skeleton>

  <div v-else class="flex min-w-0 flex-col gap-3">
      <template v-for="(item, i) in sources?.list" :key="`${item.link || item.doc_id || 'item'}-${i}`">
        <div
          class="min-w-0 bg-white dark:bg-gray-600 shadow p-[14px] rounded-[6px] cursor-pointer
          hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:shadow-lg transition duration-300 ease-in-out"
          @click="handleOpenSourceLink(item.link)"
        >
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
              <span v-if="item.disk_type" class="bg-blue-500 text-white px-[6px] py-[2px] rounded">
                {{ formatDiskType(item.disk_type) }}
              </span>
              <span v-if="item.disk_pass" class="bg-purple-500 text-white px-[6px] py-[2px] rounded">
                {{ item.disk_pass }}
              </span>
            </div>
            <div class="shrink-0">
              <span v-if="item.update_time" class="text-slate-600 px-[6px] py-[2px] rounded">
                {{ formatDate(item.update_time) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <el-skeleton v-if="appendSkeletonCount > 0" animated :count="appendSkeletonCount">
        <template #template>
          <div
            class="bg-white dark:bg-gray-600 shadow p-[14px] rounded-[6px] cursor-pointer mb-3
            hover:bg-[#f5f5f5] hover:shadow-lg transition duration-300 ease-in-out"
          >
            <div class="flex flex-row gap-2 items-center">
              <el-skeleton-item variant="image" style="width: 20px; height: 20px" />
              <el-skeleton-item variant="text" style="width: 100px;" />
            </div>
            <div>
              <el-skeleton-item variant="text" style="width: 100%;" />
            </div>
            <div>
              <el-skeleton-item variant="text" style="width: 100%;" />
            </div>
          </div>
        </template>
      </el-skeleton>
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
