import { mockDelay } from '@/utils/mock'

// 使用mock模式
const USE_MOCK = true

// 筛选配置接口
export interface KAFilterConfig {
  visibleCustomers: string[] // 显示的客户ID列表
  createTimeRange?: [string, string] // 创建时间范围
  status?: string[] // 状态筛选
  planCompleteTimeRange?: [string, string] // 计划完成时间范围
}

const STORAGE_KEY = 'KA_FILTER_CONFIG'

// 获取KA筛选配置
export const getKAFilterConfig = async (): Promise<KAFilterConfig | null> => {
  if (USE_MOCK) {
    await mockDelay()
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('解析筛选配置失败', error)
        return null
      }
    }
    return null
  }

  // 实际API调用
  return null
}

// 保存KA筛选配置
export const saveKAFilterConfig = async (config: KAFilterConfig): Promise<void> => {
  if (USE_MOCK) {
    await mockDelay()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    return
  }

  // 实际API调用
  // return request({
  //   url: '/ka/filter-config',
  //   method: 'post',
  //   data: config,
  // })
}

