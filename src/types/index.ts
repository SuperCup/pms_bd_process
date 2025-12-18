// 商机相关类型
export interface Opportunity {
  id: string
  item: string // 事项
  createTime: string // 创建时间
  createYear: number // 创建年度
  createMonth: number // 创建月份
  customer: Customer // 客户
  importance: 'important' | 'very-important' // 事项重要程度
  type: 'invitation' | 'lead' | 'purchase' | 'service' // 类型
  follower: User // 跟进人
  planCompleteTime: string // 计划完成时间
  status: 'lost' | 'won' | 'not-participate' | 'in-progress' | 'completed-visit' // 状态
  progress: string // 进展
  progressHistory: ProgressRecord[] // 历史跟进记录
  lastUpdateTime: string // 最后更新时间
  relatedDocs: string[] // 相关文档（链接/附件）
}

// 客户相关类型
export interface Customer {
  id: string
  name: string // 客户名称
  code?: string // 客户编码
  isKA: boolean // 是否为KA客户
  pmsCustomerId?: string // PMS客户ID（关联）
  contact?: string // 联系人
  phone?: string // 电话
  address?: string // 地址
  description?: string // 备注
  createTime: string
  updateTime: string
}

// 用户类型
export interface User {
  id: string
  name: string
  bu: string // 所属BU
  role: UserRole
}

// 用户角色
export type UserRole = 'admin' | 'manager' | 'business' | 'viewer'

// 跟进记录
export interface ProgressRecord {
  id: string
  opportunityId: string
  content: string
  createTime: string
  creator: User
}

// 筛选条件
export interface OpportunityFilter {
  keyword?: string // 事项搜索
  year?: number // 年度
  createTimeStart?: string // 创建时间开始
  createTimeEnd?: string // 创建时间结束
  customerIds?: string[] // 客户ID列表
  followerIds?: string[] // 跟进人ID列表
  status?: Opportunity['status']
  importance?: Opportunity['importance']
  type?: Opportunity['type']
}

// 字段配置
export interface FieldConfig {
  fieldName: string
  displayName: string
  required: boolean
  options?: string[] // 预选项
  visible: boolean
  editable: boolean
}

// 权限配置
export interface Permission {
  role: UserRole
  permissions: string[]
  fieldConfigs: FieldConfig[]
}

// 提醒规则
export interface ReminderRule {
  id: string
  name: string
  triggerDays: number[] // 触发日期（每周几）
  beforeDays: number // 提前几天提醒
  message: string // 提醒内容
  enabled: boolean
}

