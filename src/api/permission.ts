import request from '@/utils/request'
import { mockDelay } from '@/utils/mock'
import { mockPermissions } from '@/mock/data'
import type { Permission, FieldConfig } from '@/types'

// 使用mock模式
const USE_MOCK = true

// 获取权限配置
export const getPermissionConfig = async () => {
  if (USE_MOCK) {
    await mockDelay()
    return [...mockPermissions]
  }
  
  return request<Permission[]>({
    url: '/permission/config',
    method: 'get',
  })
}

// 更新权限配置
export const updatePermissionConfig = async (data: Permission[]) => {
  if (USE_MOCK) {
    await mockDelay()
    mockPermissions.splice(0, mockPermissions.length, ...data)
    return {}
  }
  
  return request({
    url: '/permission/config',
    method: 'put',
    data,
  })
}

// 获取字段配置
export const getFieldConfig = async (role: string) => {
  if (USE_MOCK) {
    await mockDelay()
    const permission = mockPermissions.find(item => item.role === role)
    return permission?.fieldConfigs || []
  }
  
  return request<FieldConfig[]>({
    url: `/permission/field-config/${role}`,
    method: 'get',
  })
}

// 更新字段配置
export const updateFieldConfig = async (role: string, data: FieldConfig[]) => {
  if (USE_MOCK) {
    await mockDelay()
    const permission = mockPermissions.find(item => item.role === role)
    if (permission) {
      permission.fieldConfigs = data
    }
    return {}
  }
  
  return request({
    url: `/permission/field-config/${role}`,
    method: 'put',
    data,
  })
}
