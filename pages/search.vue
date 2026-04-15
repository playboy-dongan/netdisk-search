<script setup>
import SearchHeader from "~/components/search/SearchHeader.vue";
import DiskInfoList from "~/components/diskInfoList.vue";
import SiteDisclaimerBar from '~/components/common/SiteDisclaimerBar.vue'
import aliImg from '@/assets/netdisk/aliyun.png'
import quarkImg from '@/assets/netdisk/quark.png'
import xunleiImg from '@/assets/netdisk/xunlei.png'
import bdyImg from '@/assets/netdisk/baidu.png'
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

const QUICK_ENGINE = 2
const DEEP_ENGINE = 4

const router = useRouter()
const route = useRoute()
const getApiHeaders = useSiteApiHeaders()
const initialKeyword = typeof route.query.keyword === 'string' ? decodeURIComponent(route.query.keyword) : ''

const keyword = ref(initialKeyword)
const currentTabValue = ref('')
const page = ref(1)
const exact = ref(false)
const primarySources = ref({})
const deepSources = ref({})
const primaryLoading = ref(true)
const deepLoading = ref(false)
const latestSourcesData = ref([])
const latestSkeletonLoading = ref(true)
const searchTaskId = ref(0)

useSeoMeta({
  title: () => `${keyword.value || '网盘资源'} 搜索结果`,
  description: () => `在 ${siteConfig.name} 中搜索 ${keyword.value || '网盘资源'}，支持阿里云盘、百度网盘、夸克网盘、迅雷网盘等多种来源。`,
})

const tabsOptions = [
  {
    label: '所有',
    value: ''
  },
  {
    label: '阿里',
    value: 'ALY',
    img: aliImg
  },
  {
    label: '百度',
    value: 'BDY',
    img: bdyImg
  },
  {
    label: '夸克',
    value: 'QUARK',
    img: quarkImg
  },
  {
    label: '迅雷',
    value: 'XUNLEI',
    img: xunleiImg
  }
]

const emptySources = () => ({
  list: [],
  total: 0,
})

const uniqueByLink = (items = []) => {
  const seen = new Set()
  return items.filter((item) => {
    const key = item?.link || item?.disk_name
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

const normalizeSearchData = (data) => ({
  list: uniqueByLink(data?.list || []),
  total: Number(data?.total || 0),
})

const buildDeepSources = (deepData, quickData) => {
  const quickLinks = new Set((quickData?.list || []).map((item) => item.link))
  const filteredList = (deepData?.list || []).filter((item) => item?.link && !quickLinks.has(item.link))

  return {
    list: filteredList,
    total: filteredList.length,
  }
}

const handleOpenSourceLink = (link) => {
  if (!link) {
    return
  }

  window.open(link, '_blank')
}

const handleOpenLatestSourceLink = async (item) => {
  if (item?.link) {
    window.open(item.link, '_blank')
    return
  }

  const res = await $fetch('/api/sources/hh/doc', {
    method: "POST",
    headers: getApiHeaders(),
    body: {
      engine: QUICK_ENGINE,
      doc_id: item.doc_id
    }
  })

  if (res.code === 200) {
    window.open(res.data.link, '_blank')
  }
}

const fetchSearchSegment = async (engine) => {
  const res = await $fetch('/api/sources/hh/search', {
    method: 'POST',
    headers: getApiHeaders(),
    body: {
      engine,
      q: keyword.value,
      page: page.value,
      size: 10,
      time: "",
      type: currentTabValue.value,
      exact: exact.value
    }
  })

  if (res.code !== 200) {
    throw new Error(res.msg || '搜索源暂时不可用，请稍后再试')
  }

  return normalizeSearchData(res.data)
}

const runSearch = async () => {
  const taskId = Date.now()
  searchTaskId.value = taskId

  if (!keyword.value) {
    primarySources.value = emptySources()
    deepSources.value = emptySources()
    primaryLoading.value = false
    deepLoading.value = false
    return
  }

  primarySources.value = emptySources()
  deepSources.value = emptySources()
  primaryLoading.value = true
  deepLoading.value = true

  try {
    const quickData = await fetchSearchSegment(QUICK_ENGINE)
    if (searchTaskId.value !== taskId) {
      return
    }

    primarySources.value = quickData
  } catch (error) {
    if (searchTaskId.value !== taskId) {
      return
    }

    primarySources.value = emptySources()
    ElMessage.error(error.message || '首批搜索结果加载失败')
  } finally {
    if (searchTaskId.value === taskId) {
      primaryLoading.value = false
    }
  }

  try {
    const deepData = await fetchSearchSegment(DEEP_ENGINE)
    if (searchTaskId.value !== taskId) {
      return
    }

    deepSources.value = buildDeepSources(deepData, primarySources.value)
  } catch (error) {
    if (searchTaskId.value === taskId) {
      deepSources.value = emptySources()
    }
  } finally {
    if (searchTaskId.value === taskId) {
      deepLoading.value = false
    }
  }
}

const search = async (value) => {
  if (!value) {
    return
  }

  keyword.value = value
  page.value = 1
  await router.replace({ path: '/search', query: { keyword: encodeURIComponent(value) } })
  await runSearch()
}

const handleChangeTab = async (value) => {
  currentTabValue.value = value
  page.value = 1
  await runSearch()
}

const handleCurrentPageChange = async (value) => {
  page.value = value
  window.scroll(0, 0)
  await runSearch()
}

const handleChangeExact = async (value) => {
  exact.value = !value
  page.value = 1
  await runSearch()
}

const getLatestSourcesData = async (targetPage, size) => {
  const res = await $fetch('/api/sources/hh/latest-sources', {
    method: 'get',
    headers: getApiHeaders(),
    query: {
      page: targetPage,
      size
    }
  })

  if (res.code === 200) {
    latestSourcesData.value = res.data
  } else {
    ElMessage.error(res.msg || '热门搜索加载失败')
  }

  latestSkeletonLoading.value = false
}

const handleGoToLatestSources = () => {
  router.push({ path: '/latest-sources' })
}

const hasAnyResult = computed(() => {
  return Boolean(primarySources.value?.list?.length || deepSources.value?.list?.length)
})

onMounted(async () => {
  await Promise.all([
    runSearch(),
    getLatestSourcesData(1, 10)
  ])
})
</script>

<template>
  <div class="dark:bg-gray-400">
    <SearchHeader :keyword="keyword" @search="search" />

    <div class="mx-auto grid max-w-[1240px] grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_360px]">
      <div class="min-w-0 flex flex-col gap-4 p-[20px] sm:mt-3 sm:pb-[60px] md:p-0">
        <div class="py-3">
          <ul class="flex flex-row flex-wrap gap-3">
            <li v-for="(item, i) in tabsOptions" :key="i">
              <el-check-tag
                class="dark:bg-gray-950"
                :checked="item.value === currentTabValue"
                @click="handleChangeTab(item.value)"
                type="success"
              >
                <div class="flex flex-row items-center">
                  <span class="text-[10px] md:text-[14px]">{{ item.label }}</span>
                </div>
              </el-check-tag>
            </li>

            <li>
              <el-check-tag
                :checked="exact"
                @click="handleChangeExact(exact)"
                type="success"
              >
                <span class="text-[10px] md:text-[14px]">精确搜索</span>
              </el-check-tag>
            </li>
          </ul>
        </div>

        <SiteDisclaimerBar />

        <div class="rounded-2xl bg-white p-4 shadow dark:bg-gray-700/50">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">首批搜索结果</h2>
            <span class="text-xs text-slate-400 dark:text-slate-300">先展示较快返回的结果</span>
          </div>

          <disk-info-list
            :sources="primarySources"
            :skeleton-loading="primaryLoading"
            @open-link="handleOpenSourceLink"
          />
        </div>

        <div class="rounded-2xl bg-white p-4 shadow dark:bg-gray-700/50">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">继续补充更多结果</h2>
            <span class="text-xs text-slate-400 dark:text-slate-300">下方会继续加载更慢但范围更广的内容</span>
          </div>

          <disk-info-list
            :sources="deepSources"
            :skeleton-loading="deepLoading"
            @open-link="handleOpenSourceLink"
          />
        </div>

        <el-empty
          v-if="!primaryLoading && !deepLoading && !hasAnyResult"
          description="暂时没有搜索结果，请尝试更换关键词、切换资源类型，或者稍后再试。"
        />

        <div class="flex justify-center py-[20px]">
          <client-only>
            <el-pagination
              background
              :current-page="page"
              :page-size="10"
              layout="prev, pager, next"
              @current-change="handleCurrentPageChange"
              :total="Math.max(primarySources?.total || 0, deepSources?.total || 0)"
            />
          </client-only>
        </div>
      </div>

      <div class="min-w-0 p-[20px] sm:py-[20px]">
        <div class="min-w-0 rounded-[6px] bg-white p-[14px] shadow dark:bg-transparent dark:shadow-gray-500">
          <div class="flex min-w-0 flex-row items-center justify-between gap-2">
            <span class="text-[14px] font-bold">热门搜索</span>
            <div>
              <el-button link icon="refresh" @click="getLatestSourcesData(1, 10)"></el-button>
              <el-button link icon="more" @click="handleGoToLatestSources()"></el-button>
            </div>
          </div>

          <div class="mt-3 grid min-h-[500px] grid-cols-1 gap-3" id="latest-sources">
            <el-skeleton animated :loading="latestSkeletonLoading" :count="10">
              <template #template>
                <div
                  class="mb-3 min-w-0 cursor-pointer rounded-[6px] bg-white p-[14px] shadow
                  transition duration-300 ease-in-out hover:bg-[#f5f5f5] hover:shadow-lg dark:bg-gray-600"
                >
                  <div class="flex min-w-0 flex-row items-center gap-2">
                    <el-skeleton-item variant="image" style="width: 20px; height: 20px" />
                    <el-skeleton-item variant="text" style="width: 100px;" />
                  </div>
                </div>
              </template>

              <template #default>
                <div
                  v-for="(item, i) in latestSourcesData?.list ? latestSourcesData?.list : latestSourcesData"
                  :key="i"
                  class="min-w-0 cursor-pointer rounded-[6px] bg-white p-[14px] shadow transition duration-300 ease-in-out
                  hover:bg-[#f5f5f5] hover:shadow-lg dark:bg-gray-600 dark:hover:bg-gray-700"
                  @click="handleOpenLatestSourceLink(item)"
                >
                  <div class="flex min-w-0 flex-row items-center gap-2">
                    <span class="min-w-0 break-all font-inter text-[14px] dark:text-slate-200">{{ item.disk_name }}</span>
                  </div>
                </div>
              </template>
            </el-skeleton>
          </div>
        </div>
      </div>
    </div>

    <el-backtop></el-backtop>
  </div>
</template>
