import request from '@/utils/request'
import { mockDelay } from '@/utils/mock'
import { mockOpportunities, mockCustomers, mockUsers } from '@/mock/data'
import type { Opportunity, OpportunityFilter } from '@/types'
import dayjs from 'dayjs'

// 使用mock模式
const USE_MOCK = true

// 获取商机列表
export const getOpportunityList = async (params: OpportunityFilter & { page?: number; pageSize?: number; sortField?: string; sortOrder?: string }) => {
  if (USE_MOCK) {
    await mockDelay()
    let filtered = [...mockOpportunities]
    
    // 筛选
    if (params.keyword) {
      filtered = filtered.filter(item => item.item.includes(params.keyword!))
    }
    if (params.year) {
      filtered = filtered.filter(item => item.createYear === params.year)
    }
    if (params.createTimeStart) {
      filtered = filtered.filter(item => dayjs(item.createTime).isAfter(dayjs(params.createTimeStart)) || dayjs(item.createTime).isSame(dayjs(params.createTimeStart), 'day'))
    }
    if (params.createTimeEnd) {
      filtered = filtered.filter(item => dayjs(item.createTime).isBefore(dayjs(params.createTimeEnd)) || dayjs(item.createTime).isSame(dayjs(params.createTimeEnd), 'day'))
    }
    if (params.customerIds && params.customerIds.length > 0) {
      filtered = filtered.filter(item => params.customerIds!.includes(item.customer.id))
    }
    if (params.followerIds && params.followerIds.length > 0) {
      filtered = filtered.filter(item => params.followerIds!.includes(item.follower.id))
    }
    if (params.status) {
      filtered = filtered.filter(item => item.status === params.status)
    }
    if (params.importance) {
      filtered = filtered.filter(item => item.importance === params.importance)
    }
    if (params.type) {
      filtered = filtered.filter(item => item.type === params.type)
    }
    
    // 排序
    if (params.sortField) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[params.sortField!]
        const bVal = (b as any)[params.sortField!]
        const order = params.sortOrder === 'desc' ? -1 : 1
        if (aVal < bVal) return -1 * order
        if (aVal > bVal) return 1 * order
        return 0
      })
    }
    
    // 分页
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      list: filtered.slice(start, end),
      total: filtered.length,
    }
  }
  
  return request<{ list: Opportunity[]; total: number }>({
    url: '/opportunity/list',
    method: 'get',
    params,
  })
}

// 获取商机详情
export const getOpportunityDetail = async (id: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const opportunity = mockOpportunities.find(item => item.id === id)
    if (!opportunity) {
      throw new Error('商机不存在')
    }
    return opportunity
  }
  
  return request<Opportunity>({
    url: `/opportunity/${id}`,
    method: 'get',
  })
}

// 创建商机
export const createOpportunity = async (data: Partial<Opportunity>) => {
  if (USE_MOCK) {
    await mockDelay()
    const newOpportunity: Opportunity = {
      id: generateId(),
      item: data.item || '',
      createTime: new Date().toISOString(),
      createYear: dayjs().year(),
      createMonth: dayjs().month() + 1,
      customer: data.customer || mockCustomers[0],
      importance: data.importance || 'important',
      type: data.type || 'invitation',
      follower: data.follower || mockUsers[0],
      planCompleteTime: data.planCompleteTime || dayjs().add(30, 'day').format('YYYY-MM-DD'),
      status: data.status || 'in-progress',
      progress: data.progress || '',
      progressHistory: [],
      lastUpdateTime: new Date().toISOString(),
      relatedDocs: data.relatedDocs || [],
    }
    mockOpportunities.unshift(newOpportunity)
    return newOpportunity
  }
  
  return request<Opportunity>({
    url: '/opportunity',
    method: 'post',
    data,
  })
}

// 更新商机
export const updateOpportunity = async (id: string, data: Partial<Opportunity>) => {
  if (USE_MOCK) {
    await mockDelay()
    const index = mockOpportunities.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('商机不存在')
    }
    mockOpportunities[index] = { ...mockOpportunities[index], ...data, lastUpdateTime: new Date().toISOString() }
    return mockOpportunities[index]
  }
  
  return request<Opportunity>({
    url: `/opportunity/${id}`,
    method: 'put',
    data,
  })
}

// 删除商机
export const deleteOpportunity = async (id: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const index = mockOpportunities.findIndex(item => item.id === id)
    if (index !== -1) {
      mockOpportunities.splice(index, 1)
    }
    return {}
  }
  
  return request({
    url: `/opportunity/${id}`,
    method: 'delete',
  })
}

// 添加跟进记录
export const addProgressRecord = async (id: string, content: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const opportunity = mockOpportunities.find(item => item.id === id)
    if (opportunity) {
      const record = {
        id: generateId(),
        opportunityId: id,
        content,
        createTime: new Date().toISOString(),
        creator: mockUsers[0],
      }
      opportunity.progressHistory.push(record)
      opportunity.progress = content
      opportunity.lastUpdateTime = new Date().toISOString()
    }
    return {}
  }
  
  return request({
    url: `/opportunity/${id}/progress`,
    method: 'post',
    data: { content },
  })
}

// 获取跟进记录
export const getProgressRecords = async (id: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const opportunity = mockOpportunities.find(item => item.id === id)
    return opportunity?.progressHistory || []
  }
  
  return request<ProgressRecord[]>({
    url: `/opportunity/${id}/progress`,
    method: 'get',
  })
}

// 获取上周新增商机
export const getLastWeekOpportunities = async () => {
  if (USE_MOCK) {
    await mockDelay()
    // 为了演示，直接返回所有商机数据
    // 实际应该筛选上周的数据
    return mockOpportunities
  }
  
  return request<Opportunity[]>({
    url: '/opportunity/last-week',
    method: 'get',
  })
}

// 获取KA客户商机
export const getKAOpportunities = async () => {
  if (USE_MOCK) {
    await mockDelay()
    return mockOpportunities.filter(item => item.customer.isKA)
  }
  
  return request<Opportunity[]>({
    url: '/opportunity/ka',
    method: 'get',
  })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

import type { ProgressRecord } from '@/types'
