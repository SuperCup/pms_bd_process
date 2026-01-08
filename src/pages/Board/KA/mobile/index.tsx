import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Empty, Spin, Tag } from 'antd'
import { getKAOpportunities } from '@/api/opportunity'
import type { Opportunity } from '@/types'
import { formatDate } from '@/utils'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS } from '@/utils/constants'
import '../index.less'

const BoardKAMobile: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [groupedData, setGroupedData] = useState<Record<string, Opportunity[]>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getKAOpportunities()
      // 按客户分组
      const grouped: Record<string, Opportunity[]> = {}
      res.forEach((item) => {
        const customerName = item.customer.name
        if (!grouped[customerName]) {
          grouped[customerName] = []
        }
        grouped[customerName].push(item)
      })

      // 对每个分组按创建时间排序
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        })
      })

      setGroupedData(grouped)
    } catch (error) {
      console.error('获取KA客户商机失败', error)
    } finally {
      setLoading(false)
    }
  }

  const getImportanceTag = (importance: Opportunity['importance']) => {
    const option = IMPORTANCE_OPTIONS.find((opt) => opt.value === importance)
    if (importance === 'very-important') {
      return <Tag color="red">{option?.label}</Tag>
    }
    return <Tag color="green">{option?.label}</Tag>
  }

  const getTypeTag = (type: Opportunity['type']) => {
    const option = TYPE_OPTIONS.find((opt) => opt.value === type)
    const colorMap: Record<string, string> = {
      invitation: 'green',
      lead: 'purple',
      purchase: 'blue',
      service: 'cyan',
    }
    return <Tag color={colorMap[type] || 'default'}>{option?.label}</Tag>
  }

  const getCustomerTagColor = (customerName: string) => {
    // 根据客户名称返回不同的颜色
    const colors: Record<string, string> = {
      '和路雪': 'purple',
      '雀巢': 'green',
      // 可以添加更多客户颜色映射
    }
    return colors[customerName] || 'blue'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  const customerNames = Object.keys(groupedData).sort()

  if (customerNames.length === 0) {
    return <Empty description="暂无KA客户商机" />
  }

  return (
    <div className="board-ka-page">
      <div className="mobile-board-content">
        {customerNames.map((customerName) => {
          const opportunities = groupedData[customerName]
          return (
            <div key={customerName} className="mobile-customer-section">
              <div className="mobile-section-header">
                <Tag color={getCustomerTagColor(customerName)}>{customerName}</Tag>
              </div>
              <div className="mobile-opportunity-list">
                {opportunities.map((item) => (
                  <div
                    key={item.id}
                    className="mobile-opportunity-item"
                    onClick={() => navigate(`/opportunity/detail/${item.id}`)}
                  >
                    <div className="item-name">{item.item}</div>
                    <div className="item-info">
                      <div className="info-row">
                        <span className="info-label">计划完成时间：</span>
                        <span className="info-value">{formatDate(item.planCompleteTime, 'YYYY-MM-DD')}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">重要程度：</span>
                        <span className="info-value">{getImportanceTag(item.importance)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">类型：</span>
                        <span className="info-value">{getTypeTag(item.type)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">跟进人：</span>
                        <span className="info-value">{item.follower.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BoardKAMobile

