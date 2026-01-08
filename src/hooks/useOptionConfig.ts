import { useState, useEffect } from 'react'
import { getOptionConfig, type OptionConfig } from '@/api/optionConfig'

export const useOptionConfig = () => {
  const [config, setConfig] = useState<OptionConfig>({
    importance: [],
    status: [],
    type: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getOptionConfig()
      setConfig(data)
    } catch (error) {
      console.error('加载选项配置失败', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    config,
    loading,
    reload: loadConfig,
  }
}

