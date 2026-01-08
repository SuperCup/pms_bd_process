import { mockDelay } from '@/utils/mock'

// 使用mock模式
const USE_MOCK = true

// 选项配置接口
export interface OptionItem {
  label: string
  value: string
}

export interface OptionConfig {
  importance: OptionItem[] // 重要程度选项
  status: OptionItem[] // 状态选项
  type: OptionItem[] // 类型选项
}

const STORAGE_KEY = 'OPPORTUNITY_OPTION_CONFIG'

// 默认配置
const DEFAULT_CONFIG: OptionConfig = {
  importance: [
    { label: '重要', value: 'important' },
    { label: '20万+非常重要', value: 'very-important' },
  ],
  status: [
    { label: '流失', value: 'lost' },
    { label: '中标', value: 'won' },
    { label: '不参标', value: 'not-participate' },
    { label: '进行中', value: 'in-progress' },
    { label: '完成拜访', value: 'completed-visit' },
  ],
  type: [
    { label: '客户邀标', value: 'invitation' },
    { label: '线索获取', value: 'lead' },
    { label: '采购入库', value: 'purchase' },
    { label: '服务介绍', value: 'service' },
  ],
}

// 获取选项配置
export const getOptionConfig = async (): Promise<OptionConfig> => {
  if (USE_MOCK) {
    await mockDelay()
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const config = JSON.parse(saved)
        // 合并默认配置，确保所有字段都存在
        return {
          importance: config.importance || DEFAULT_CONFIG.importance,
          status: config.status || DEFAULT_CONFIG.status,
          type: config.type || DEFAULT_CONFIG.type,
        }
      } catch (error) {
        console.error('解析选项配置失败', error)
        return DEFAULT_CONFIG
      }
    }
    return DEFAULT_CONFIG
  }

  // 实际API调用
  // return request<OptionConfig>({
  //   url: '/opportunity/option-config',
  //   method: 'get',
  // })
  return DEFAULT_CONFIG
}

// 保存选项配置
export const saveOptionConfig = async (config: OptionConfig): Promise<void> => {
  if (USE_MOCK) {
    await mockDelay()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    return
  }

  // 实际API调用
  // return request({
  //   url: '/opportunity/option-config',
  //   method: 'post',
  //   data: config,
  // })
}

