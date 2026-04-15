<script setup>
import SearchHeader from "~/components/search/SearchHeader.vue";
import DiskInfoList from "~/components/diskInfoList.vue";
import aliImg from '@/assets/netdisk/aliyun.png'
import quarkImg from '@/assets/netdisk/quark.png'
import xunleiImg from '@/assets/netdisk/xunlei.png'
import bdyImg from '@/assets/netdisk/baidu.png'
import { siteConfig } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

const router = useRouter()
const route = useRoute()
const getApiHeaders = useSiteApiHeaders()
const initialKeyword = typeof route.query.keyword === 'string' ? decodeURIComponent(route.query.keyword) : ''

const keyword = ref(initialKeyword)
const currentTabValue = ref('')
const page = ref(1)
const exact = ref(false)
const sources = ref({})
const skeletonLoading = ref(true)
const currentEngine = ref(2)
const latestSourcesData = ref([])
const latestSkeletonLoading = ref(true)
const apiEndpointsData = ref([])

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
      engine: currentEngine.value,
      doc_id: item.doc_id
    }
  })

  if (res.code === 200) {
    window.open(res.data.link, '_blank')
  }
}

const handleSearchByHunhe = async () => {
  const res = await $fetch('/api/sources/hh/search', {
    method: 'POST',
    headers: getApiHeaders(),
    body: {
      engine: currentEngine.value,
      q: keyword.value,
      page: page.value,
      size: 10,
      time: "",
      type: currentTabValue.value,
      exact: exact.value
    }
  })

  if (res.code === 200) {
    sources.value = res.data
  } else {
    ElMessage.error(res.msg || '搜索源暂时不可用，请稍后再试')
  }

  skeletonLoading.value = false
}

const getLatestSourcesData = async (targetPage, size) => {
  const res = await $fetch('/api/sources/hh/latest-sources', {
    method: 'get',
    headers: getApiHeaders(),
    query: {
      engine: currentEngine.value,
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

const getApiEndpoints = async () => {
  apiEndpointsData.value = await $fetch('/api/sources/api-endpoints', {
    headers: getApiHeaders(),
  })
}

const runSearch = async () => {
  if (!keyword.value) {
    sources.value = {}
    skeletonLoading.value = false
    return
  }

  skeletonLoading.value = true
  await handleSearchByHunhe()
}

const search = async (value) => {
  if (!value) {
    return
  }

  keyword.value = value
  page.value = 1
  sources.value = {}
  await router.replace({ path: '/search', query: { keyword: encodeURIComponent(value) } })
  await runSearch()
}

const handleChangeTab = async (value) => {
  currentTabValue.value = value
  page.value = 1
  sources.value = {}
  skeletonLoading.value = true
  await handleSearchByHunhe()
}

const handleCurrentPageChange = async (value) => {
  page.value = value
  skeletonLoading.value = true
  window.scroll(0, 0)
  await handleSearchByHunhe()
}

const handleChangeExact = async (value) => {
  exact.value = !value
  sources.value = {}
  skeletonLoading.value = true
  await handleSearchByHunhe()
}

const handleEngineChange = async (value) => {
  currentEngine.value = value
  page.value = 1
  sources.value = {}
  latestSourcesData.value = []
  skeletonLoading.value = true
  latestSkeletonLoading.value = true

  await Promise.all([
    handleSearchByHunhe(),
    getLatestSourcesData(1, 10)
  ])
}

const handleGoToLatestSources = () => {
  router.push({ path: '/latest-sources' })
}

onMounted(async () => {
  await getApiEndpoints()
  await Promise.all([
    runSearch(),
    getLatestSourcesData(1, 10)
  ])
})
</script>

<template>
  <div class="dark:bg-gray-400">
    <SearchHeader :keyword="keyword" @search="search" />

    <div class="mx-auto grid max-w-[1240px] grid-cols-1 gap-8 md:grid-cols-[1fr_400px]">
      <div class="flex flex-col gap-3 p-[20px] sm:mt-3 sm:pb-[60px] md:p-0">
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

            <li>
              <el-select
                v-model="currentEngine"
                placeholder="选择搜索模式"
                style="width: 220px"
                value-key="engine"
                @change="handleEngineChange"
              >
                <el-option
                  v-for="item in apiEndpointsData"
                  :key="item.engine"
                  :label="item.engine_name"
                  :value="item.engine"
                />
              </el-select>
            </li>
          </ul>
        </div>

        <disk-info-list
          :sources="sources"
          :skeleton-loading="skeletonLoading"
          @open-link="handleOpenSourceLink"
        />

        <el-empty
          v-if="!skeletonLoading && (!sources?.list || !sources?.list.length)"
          description="暂时没有搜索结果，请尝试更换关键词、切换资源类型，或者稍后再试。"
        />

        <div class="flex justify-center py-[40px]">
          <client-only>
            <el-pagination
              background
              :current-page="page"
              :page-size="10"
              layout="prev, pager, next"
              @current-change="handleCurrentPageChange"
              :total="sources?.total"
            />
          </client-only>
        </div>
      </div>

      <div class="p-[20px] sm:py-[20px]">
        <div class="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-7 text-sky-800">
          已启用基础限流、页面令牌校验和搜索缓存保护。若短时间请求过多，系统会临时限制访问；深度搜索范围更大，但响应会更慢。
        </div>

        <div class="rounded-[6px] bg-white p-[14px] shadow dark:bg-transparent dark:shadow-gray-500">
          <div class="flex flex-row items-center justify-between">
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
                  class="mb-3 cursor-pointer rounded-[6px] bg-white p-[14px] shadow
                  transition duration-300 ease-in-out hover:bg-[#f5f5f5] hover:shadow-lg dark:bg-gray-600"
                >
                  <div class="flex flex-row items-center gap-2">
                    <el-skeleton-item variant="image" style="width: 20px; height: 20px" />
                    <el-skeleton-item variant="text" style="width: 100px;" />
                  </div>
                </div>
              </template>

              <template #default>
                <div
                  v-for="(item, i) in latestSourcesData?.list ? latestSourcesData?.list : latestSourcesData"
                  :key="i"
                  class="cursor-pointer rounded-[6px] bg-white p-[14px] shadow transition duration-300 ease-in-out
                  hover:bg-[#f5f5f5] hover:shadow-lg dark:bg-gray-600 dark:hover:bg-gray-700"
                  @click="handleOpenLatestSourceLink(item)"
                >
                  <div class="flex flex-row items-center gap-2">
                    <span class="truncate break-words font-inter text-[14px] dark:text-slate-200">{{ item.disk_name }}</span>
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
