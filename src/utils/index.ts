import dayjs, { Dayjs } from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import 'dayjs/locale/zh-cn'

dayjs.extend(weekOfYear)
dayjs.locale('zh-cn')

// 日期格式化
export const formatDate = (date: string | Date | Dayjs, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format)
}

// 获取上周的日期范围
export const getLastWeekRange = (): { start: string; end: string } => {
  const today = dayjs()
  const lastWeekStart = today.subtract(1, 'week').startOf('week')
  const lastWeekEnd = today.subtract(1, 'week').endOf('week')
  
  return {
    start: lastWeekStart.format('YYYY-MM-DD'),
    end: lastWeekEnd.format('YYYY-MM-DD'),
  }
}

// 判断是否为移动端（结合 userAgent 和屏幕宽度）
export const isMobile = (): boolean => {
  // 检查 userAgent
  const uaMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // 检查屏幕宽度（移动端通常小于 768px）
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768
  
  return uaMatch || isSmallScreen
}

// 判断是否在企微环境
export const isWeChatWork = (): boolean => {
  return /wxwork/i.test(navigator.userAgent)
}

// 判断是否在H5环境
export const isH5 = (): boolean => {
  return isMobile() || isWeChatWork()
}

// 判断是否应该显示提醒（距离计划完成时间前3天开始）
export const shouldShowReminder = (planCompleteTime: string): boolean => {
  const planDate = dayjs(planCompleteTime)
  const today = dayjs().startOf('day')
  const daysDiff = planDate.diff(today, 'day')
  
  // 距离计划完成时间前3天开始显示提醒（包括当天）
  return daysDiff >= 0 && daysDiff <= 3
}

// 获取提醒天数
export const getReminderDays = (planCompleteTime: string): number => {
  const planDate = dayjs(planCompleteTime)
  const today = dayjs().startOf('day')
  const daysDiff = planDate.diff(today, 'day')
  return daysDiff
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

// 下载文件
export const downloadFile = (url: string, filename?: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 生成唯一ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// 数组去重（根据指定字段）
export const uniqueBy = <T>(arr: T[], key: keyof T): T[] => {
  const seen = new Set()
  return arr.filter((item) => {
    const val = item[key]
    if (seen.has(val)) {
      return false
    }
    seen.add(val)
    return true
  })
}

