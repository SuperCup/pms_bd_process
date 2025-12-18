import request from '@/utils/request'
import { mockDelay } from '@/utils/mock'
import { mockUsers } from '@/mock/data'
import type { User } from '@/types'

// 使用mock模式
const USE_MOCK = true

// 获取用户列表
export const getUserList = async (params?: { bu?: string; role?: string }) => {
  if (USE_MOCK) {
    await mockDelay()
    let filtered = [...mockUsers]
    
    if (params?.bu) {
      filtered = filtered.filter(item => item.bu === params.bu)
    }
    if (params?.role) {
      filtered = filtered.filter(item => item.role === params.role)
    }
    
    return filtered
  }
  
  return request<User[]>({
    url: '/user/list',
    method: 'get',
    params,
  })
}

// 获取当前用户信息
export const getCurrentUser = async () => {
  if (USE_MOCK) {
    await mockDelay()
    return mockUsers[0]
  }
  
  return request<User>({
    url: '/user/current',
    method: 'get',
  })
}
