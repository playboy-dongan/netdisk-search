<script setup>
import SearchHeader from "~/components/search/SearchHeader.vue";
import DiskInfoList from "~/components/diskInfoList.vue";
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '热门搜索',
  description: `查看 ${siteConfig.name} 当前推荐的热门搜索关键词。`,
})

const keyword = ref('')
const router = useRouter()
const latestSourcesData = ref([])
const latestPage = ref(1)
const latestSize = ref(10)

const search = (value) => {
  router.push({ path: '/search', query: { keyword: encodeURIComponent(value) } })
}

const getLatestSourcesData = async (page, size) => {
  const loading = ElLoading.service({
    text: '加载中...',
    background: 'transparent',
    target: '#latest-sources-all',
  })

  const res = await $fetch('/api/sources/hh/latest-sources', {
    method: 'get',
    query: {
      page,
      size
    }
  })

  if (res.code === 200) {
    latestSourcesData.value = res.data
  }

  loading.close()
}

const handleLatestPageChange = (page) => {
  latestPage.value = page
  window.scroll(0, 0)
  getLatestSourcesData(latestPage.value, latestSize.value)
}

const handleOpenSourceLink = (url) => {
  window.open(url, '_blank')
}

onMounted(() => {
  getLatestSourcesData(latestPage.value, latestSize.value)
})
</script>

<template>
  <div class="min-h-screen">
    <SearchHeader :keyword="keyword" @search="search" />

    <div class="max-w-[1240px] mx-auto p-[20px] sm:py-[20px]">
      <div class="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_400px] gap-8">
        <div class="min-h-[calc(100vh-90px)]" id="latest-sources-all">
          <div class="text-xl font-bold dark:text-white">热门搜索</div>
          <div class="grid grid-cols-1 gap-3 mt-3">
            <DiskInfoList :sources="latestSourcesData" @open-link="handleOpenSourceLink" />
          </div>
          <div class="mt-[20px] flex justify-center">
            <client-only>
              <el-pagination
                layout="prev, pager, next"
                @current-change="handleLatestPageChange"
                :total="latestSourcesData?.total"
              />
            </client-only>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
