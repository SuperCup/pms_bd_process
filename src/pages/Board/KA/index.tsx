import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Empty, Spin, Tag, Avatar } from 'antd'
import { DownOutlined, RightOutlined } from '@ant-design/icons'
import { getKAOpportunities } from '@/api/opportunity'
import type { Opportunity } from '@/types'
import { formatDate } from '@/utils'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import type { ColumnsType } from 'antd/es/table'
import './index.less'

const BoardKA: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [groupedData, setGroupedData] = useState<Record<string, Opportunity[]>>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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
      // 默认展开所有客户组
      setExpandedRows(new Set(Object.keys(grouped)))
    } catch (error) {
      console.error('获取KA客户商机失败', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (customerName: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(customerName)) {
      newExpanded.delete(customerName)
    } else {
      newExpanded.add(customerName)
    }
    setExpandedRows(newExpanded)
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

  const getStatusTag = (status: Opportunity['status']) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    const colorMap: Record<string, string> = {
      lost: 'red',
      won: 'gold',
      'not-participate': 'orange',
      'in-progress': 'blue',
      'completed-visit': 'default',
    }
    return <Tag color={colorMap[status]}>{option?.label}</Tag>
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

  const getAvatarColor = (name: string) => {
    // 根据姓名返回不同的背景色
    const colors: Record<string, string> = {
      '黄贤春': '#ffc53d',
      '赵露明': '#ff4d4f',
      '王雄军': '#9254de',
    }
    return colors[name] || '#1890ff'
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

  // 计算全局行号
  const getGlobalRowNumber = (customerName: string, localIndex: number) => {
    const currentGroupIndex = customerNames.indexOf(customerName)
    let rowNum = localIndex + 1
    for (let i = 0; i < currentGroupIndex; i++) {
      const name = customerNames[i]
      if (expandedRows.has(name)) {
        rowNum += groupedData[name].length
      }
    }
    return rowNum
  }

  const createColumns = (customerName: string): ColumnsType<Opportunity> => [
    {
      title: '',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => getGlobalRowNumber(customerName, index),
    },
    {
      title: '事项',
      dataIndex: 'item',
      key: 'item',
      width: 300,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 140,
      render: (time) => formatDate(time, 'YYYY年MM月DD日'),
    },
    {
      title: '客户',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 120,
      render: (name) => <Tag color={getCustomerTagColor(name)}>{name}</Tag>,
    },
    {
      title: '事项重要程度',
      dataIndex: 'importance',
      key: 'importance',
      width: 140,
      render: (importance) => getImportanceTag(importance),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getTypeTag(type),
    },
    {
      title: '跟进人',
      dataIndex: ['follower', 'name'],
      key: 'follower',
      width: 120,
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" style={{ backgroundColor: getAvatarColor(name) }}>
            {name.charAt(name.length - 1)}
          </Avatar>
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: '计划完成日期',
      dataIndex: 'planCompleteTime',
      key: 'planCompleteTime',
      width: 140,
      render: (time) => formatDate(time, 'YYYY年MM月DD日'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '进展',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      ellipsis: true,
      render: (progress) => progress || '-',
    },
  ]

  return (
    <div className="board-ka-page">
      <div className="page-header">
        <h2 className="page-title">KA客户事项看板</h2>
      </div>

      <div className="board-content">
        {customerNames.map((customerName) => {
          const isExpanded = expandedRows.has(customerName)
          const opportunities = groupedData[customerName]

          return (
            <div key={customerName} className="customer-group">
              <div
                className="group-header"
                onClick={() => toggleRow(customerName)}
              >
                <div className="group-title">
                  {isExpanded ? <DownOutlined /> : <RightOutlined />}
                  <Tag color={getCustomerTagColor(customerName)}>{customerName}</Tag>
                </div>
              </div>

              {isExpanded && (
                <>
                  <Table
                    columns={createColumns(customerName)}
                    dataSource={opportunities.map((item) => ({
                      ...item,
                      key: item.id,
                    }))}
                    pagination={false}
                    size="small"
                    className="ka-table"
                    onRow={(record) => ({
                      onClick: () => navigate(`/opportunity/detail/${record.id}`),
                      style: { cursor: 'pointer' },
                    })}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BoardKA
