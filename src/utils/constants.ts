// 事项重要程度选项
export const IMPORTANCE_OPTIONS = [
  { label: '重要', value: 'important' },
  { label: '20万+非常重要', value: 'very-important' },
]

// 事项类型选项
export const TYPE_OPTIONS = [
  { label: '客户邀标', value: 'invitation' },
  { label: '线索获取', value: 'lead' },
  { label: '采购入库', value: 'purchase' },
  { label: '服务介绍', value: 'service' },
]

// 状态选项
export const STATUS_OPTIONS = [
  { label: '流失', value: 'lost' },
  { label: '中标', value: 'won' },
  { label: '不参标', value: 'not-participate' },
  { label: '进行中', value: 'in-progress' },
  { label: '完成拜访', value: 'completed-visit' },
]

// 用户角色选项
export const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '管理层', value: 'manager' },
  { label: '业务人员', value: 'business' },
  { label: '查看者', value: 'viewer' },
]

// 排序选项
export const SORT_OPTIONS = [
  { label: '按计划完成时间升序', value: 'planCompleteTime_asc' },
  { label: '按计划完成时间降序', value: 'planCompleteTime_desc' },
  { label: '按创建时间升序', value: 'createTime_asc' },
  { label: '按创建时间降序', value: 'createTime_desc' },
  { label: '按最后更新时间升序', value: 'lastUpdateTime_asc' },
  { label: '按最后更新时间降序', value: 'lastUpdateTime_desc' },
]

// 周几映射（用于提醒规则）
export const WEEKDAY_MAP = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
}

// 页面路径
export const ROUTE_PATH = {
  HOME: '/',
  OPPORTUNITY_LIST: '/opportunity/list',
  OPPORTUNITY_DETAIL: '/opportunity/detail/:id',
  OPPORTUNITY_EDIT: '/opportunity/edit/:id?',
  CUSTOMER_LIST: '/customer/list',
  CUSTOMER_DETAIL: '/customer/detail/:id',
  CUSTOMER_EDIT: '/customer/edit/:id?',
  BOARD_LAST_WEEK: '/board/last-week',
  BOARD_KA: '/board/ka',
  PERMISSION: '/permission',
  REMINDER: '/reminder',
}

// 存储key
export const STORAGE_KEY = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  FIELD_CONFIG: 'fieldConfig',
}

// 行业选项
export const INDUSTRY_OPTIONS = [
  { label: '包装食品', value: '包装食品' },
  { label: '宠物食品', value: '宠物食品' },
  { label: '饮料乳品', value: '饮料乳品' },
  { label: '母婴', value: '母婴' },
  { label: '个护美妆', value: '个护美妆' },
  { label: '家电', value: '家电' },
]

// 主要业务选项（示例，可根据实际需求调整）
export const MAIN_BUSINESS_OPTIONS = [
  { label: '采购', value: '采购' },
  { label: '销售', value: '销售' },
  { label: '市场推广', value: '市场推广' },
  { label: '品牌合作', value: '品牌合作' },
  { label: '渠道拓展', value: '渠道拓展' },
]

