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

  if (currentEngine.value !== 8) {
    const res = await $fetch('/api/sources/hh/doc', {
      method: "POST",
      body: {
        engine: currentEngine.value,
        doc_id: item.doc_id
      }
    })

    if (res.code === 200) {
      window.open(res.data.link, '_blank')
    }
    return
  }

  window.open(item.link, '_blank')
}

const handleSearchByHunhe = async () => {
  const res = await $fetch('/api/sources/hh/search', {
    method: 'POST',
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
  apiEndpointsData.value = await $fetch('/api/sources/api-endpoints')
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

    <div class="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_400px] gap-8">
      <div class="flex flex-col gap-3 sm:mt-3 sm:pb-[60px] p-[20px] md:p-0">
        <div class="py-3">
          <ul class="flex flex-row gap-3 flex-wrap">
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
                placeholder="Select"
                style="width: 180px"
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
          description="暂时没有搜索结果，请尝试更换关键词、切换资源类型，或者切换搜索模式"
        />

        <div class="py-[40px] flex justify-center">
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
        <div class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          当前站点已切换为 PanSou 聚合接口。若个别资源点不开，通常是资源本身失效，不是网站部署错误。
        </div>

        <div class="bg-white dark:bg-transparent dark:shadow-gray-500 shadow p-[14px] rounded-[6px]">
          <div class="flex flex-row justify-between items-center">
            <span class="text-[14px] font-bold">热门搜索</span>
            <div>
              <el-button link icon="refresh" @click="getLatestSourcesData(1, 10)"></el-button>
              <el-button link icon="more" @click="handleGoToLatestSources()"></el-button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 mt-3 min-h-[500px]" id="latest-sources">
            <el-skeleton animated :loading="latestSkeletonLoading" :count="10">
              <template #template>
                <div
                  class="bg-white dark:bg-gray-600 shadow p-[14px] rounded-[6px] cursor-pointer mb-3
                  hover:bg-[#f5f5f5] hover:shadow-lg transition duration-300 ease-in-out"
                >
                  <div class="flex flex-row gap-2 items-center">
                    <el-skeleton-item variant="image" style="width: 20px; height: 20px" />
                    <el-skeleton-item variant="text" style="width: 100px;" />
                  </div>
                </div>
              </template>

              <template #default>
                <div
                  v-for="(item, i) in latestSourcesData?.list ? latestSourcesData?.list : latestSourcesData"
                  :key="i"
                  class="bg-white dark:bg-gray-600 shadow p-[14px] rounded-[6px] cursor-pointer
                  hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:shadow-lg transition duration-300 ease-in-out"
                  @click="handleOpenLatestSourceLink(item)"
                >
                  <div class="flex flex-row gap-2 items-center">
                    <span class="text-[14px] font-inter break-words truncate dark:text-slate-200">{{ item.disk_name }}</span>
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
