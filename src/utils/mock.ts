// 模拟API延迟
export const mockDelay = (ms: number = 300) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}






