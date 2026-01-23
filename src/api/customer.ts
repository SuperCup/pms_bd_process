import request from '@/utils/request'
import { mockDelay } from '@/utils/mock'
import { mockCustomers } from '@/mock/data'
import type { Customer } from '@/types'

// 使用mock模式
const USE_MOCK = true

// 获取客户列表
export const getCustomerList = async (params?: { keyword?: string; isKA?: boolean; mainVP?: string; customerType?: string; page?: number; pageSize?: number }) => {
  if (USE_MOCK) {
    await mockDelay()
    let filtered = [...mockCustomers]
    
    if (params?.keyword) {
      filtered = filtered.filter(item => item.name.includes(params.keyword!))
    }
    if (params?.isKA !== undefined) {
      filtered = filtered.filter(item => item.isKA === params.isKA)
    }
    if (params?.mainVP) {
      filtered = filtered.filter(item => item.mainVP === params.mainVP)
    }
    if (params?.customerType) {
      filtered = filtered.filter(item => item.customerType === params.customerType)
    }
    
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      list: filtered.slice(start, end),
      total: filtered.length,
    }
  }
  
  return request<{ list: Customer[]; total: number }>({
    url: '/customer/list',
    method: 'get',
    params,
  })
}

// 获取客户详情
export const getCustomerDetail = async (id: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const customer = mockCustomers.find(item => item.id === id)
    if (!customer) {
      throw new Error('客户不存在')
    }
    return customer
  }
  
  return request<Customer>({
    url: `/customer/${id}`,
    method: 'get',
  })
}

// 创建客户
export const createCustomer = async (data: Partial<Customer>) => {
  if (USE_MOCK) {
    await mockDelay()
    const newCustomer: Customer = {
      id: generateId(),
      name: data.name || '',
      code: data.code,
      isKA: data.isKA || false,
      pmsCustomer: data.pmsCustomer,
      contacts: data.contacts || [],
      address: data.address,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    }
    mockCustomers.push(newCustomer)
    return newCustomer
  }
  
  return request<Customer>({
    url: '/customer',
    method: 'post',
    data,
  })
}

// 更新客户
export const updateCustomer = async (id: string, data: Partial<Customer>) => {
  if (USE_MOCK) {
    await mockDelay()
    const index = mockCustomers.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('客户不存在')
    }
    mockCustomers[index] = { ...mockCustomers[index], ...data, updateTime: new Date().toISOString() }
    return mockCustomers[index]
  }
  
  return request<Customer>({
    url: `/customer/${id}`,
    method: 'put',
    data,
  })
}

// 删除客户
export const deleteCustomer = async (id: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const index = mockCustomers.findIndex(item => item.id === id)
    if (index !== -1) {
      mockCustomers.splice(index, 1)
    }
    return {}
  }
  
  return request({
    url: `/customer/${id}`,
    method: 'delete',
  })
}

// 检查客户是否存在（去重）
export const checkCustomerDuplicate = async (name: string, excludeId?: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const exists = mockCustomers.some(item => item.name === name && item.id !== excludeId)
    return { exists }
  }
  
  return request<{ exists: boolean }>({
    url: '/customer/check-duplicate',
    method: 'get',
    params: { name, excludeId },
  })
}

// 关联PMS客户
export const linkPMSCustomer = async (id: string, pmsCustomer: Customer['pmsCustomer']) => {
  if (USE_MOCK) {
    await mockDelay()
    const customer = mockCustomers.find(item => item.id === id)
    if (customer) {
      customer.pmsCustomer = pmsCustomer
      customer.updateTime = new Date().toISOString()
    }
    return {}
  }
  
  return request({
    url: `/customer/${id}/link-pms`,
    method: 'post',
    data: { pmsCustomer },
  })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}
