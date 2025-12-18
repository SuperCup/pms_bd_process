import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Empty, Spin, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getLastWeekOpportunities } from '@/api/opportunity'
import type { Opportunity } from '@/types'
import { formatDate } from '@/utils'
import { IMPORTANCE_OPTIONS } from '@/utils/constants'
import './index.less'

const BoardLastWeek: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [groupedData, setGroupedData] = useState<Record<string, Opportunity[]>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getLastWeekOpportunities()
      // 按跟进人分组
      const grouped: Record<string, Opportunity[]> = {}
      res.forEach((item) => {
        const followerName = item.follower.name
        if (!grouped[followerName]) {
          grouped[followerName] = []
        }
        grouped[followerName].push(item)
      })

      // 对每个分组按创建时间和状态排序
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
          // 先按状态排序（进行中优先）
          const statusOrder: Record<string, number> = {
            'in-progress': 0,
            'completed-visit': 1,
            won: 2,
            'not-participate': 3,
            lost: 4,
          }
          const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
          if (statusDiff !== 0) return statusDiff
          
          // 再按创建时间降序
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        })
      })

      setGroupedData(grouped)
    } catch (error) {
      console.error('获取上周新增商机失败', error)
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  const followerNames = Object.keys(groupedData).sort()

  if (followerNames.length === 0) {
    return <Empty description="暂无上周新增商机" />
  }

  return (
    <div className="board-last-week-page">
      <div className="page-header">
        <h2 className="page-title">上周新增商机看板</h2>
      </div>

      <div className="board-content">
        {followerNames.map((followerName) => (
          <div key={followerName} className="follower-column">
            <div className="column-header">
              <div className="follower-info">
                <UserOutlined className="follower-icon" />
                <span className="follower-name">{followerName}</span>
              </div>
              <span className="item-count">{groupedData[followerName].length}</span>
            </div>
            <div className="cards-container">
              {groupedData[followerName].map((item) => (
                <Card
                  key={item.id}
                  className="opportunity-card"
                  hoverable
                  onClick={() => navigate(`/opportunity/detail/${item.id}`)}
                >
                  <div className="card-month">
                    {formatDate(item.createTime, 'YYYY年MM月')}
                  </div>
                  <div className="card-item-text">{item.item}</div>
                  <div className="card-importance">
                    {getImportanceTag(item.importance)}
                  </div>
                  <div className="card-date">
                    <span className="date-label">计划完成日期：</span>
                    <span className="date-value">{formatDate(item.planCompleteTime, 'YYYY年MM月DD日')}</span>
                  </div>
                  <div className="card-date">
                    <span className="date-label">创建时间：</span>
                    <span className="date-value">{formatDate(item.createTime, 'YYYY年MM月DD日')}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BoardLastWeek
