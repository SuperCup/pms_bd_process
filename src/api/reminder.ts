import request from '@/utils/request'
import { mockDelay } from '@/utils/mock'
import { mockReminderRules } from '@/mock/data'
import type { ReminderRule } from '@/types'

// 使用mock模式
const USE_MOCK = true

// 获取提醒规则列表
export const getReminderRules = async () => {
  if (USE_MOCK) {
    await mockDelay()
    return [...mockReminderRules]
  }
  
  return request<ReminderRule[]>({
    url: '/reminder/rules',
    method: 'get',
  })
}

// 创建提醒规则
export const createReminderRule = async (data: Partial<ReminderRule>) => {
  if (USE_MOCK) {
    await mockDelay()
    const newRule: ReminderRule = {
      id: generateId(),
      name: data.name || '',
      triggerDays: data.triggerDays || [],
      beforeDays: data.beforeDays || 0,
      message: data.message || '',
      enabled: data.enabled !== undefined ? data.enabled : true,
    }
    mockReminderRules.push(newRule)
    return newRule
  }
  
  return request<ReminderRule>({
    url: '/reminder/rule',
    method: 'post',
    data,
  })
}

// 更新提醒规则
export const updateReminderRule = async (id: string, data: Partial<ReminderRule>) => {
  if (USE_MOCK) {
    await mockDelay()
    const index = mockReminderRules.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('提醒规则不存在')
    }
    mockReminderRules[index] = { ...mockReminderRules[index], ...data }
    return mockReminderRules[index]
  }
  
  return request<ReminderRule>({
    url: `/reminder/rule/${id}`,
    method: 'put',
    data,
  })
}

// 删除提醒规则
export const deleteReminderRule = async (id: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const index = mockReminderRules.findIndex(item => item.id === id)
    if (index !== -1) {
      mockReminderRules.splice(index, 1)
    }
    return {}
  }
  
  return request({
    url: `/reminder/rule/${id}`,
    method: 'delete',
  })
}

// 触发提醒
export const triggerReminder = async (id: string) => {
  if (USE_MOCK) {
    await mockDelay()
    return {}
  }
  
  return request({
    url: `/reminder/trigger/${id}`,
    method: 'post',
  })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}
