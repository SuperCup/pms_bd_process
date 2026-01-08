import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Space, Card, message, Tooltip } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import OpportunityFilter from '@/components/OpportunityFilter'
import OptionConfigModal from '@/components/OptionConfigModal'
import { getOpportunityList } from '@/api/opportunity'
import { getUserList } from '@/api/user'
import { getCustomerList } from '@/api/customer'
import { getOptionConfig } from '@/api/optionConfig'
import { useOpportunityStore } from '@/stores/opportunityStore'
import type { Opportunity } from '@/types'
import { formatDate, shouldShowReminder } from '@/utils'
import dayjs from 'dayjs'
import { isH5 } from '@/utils'
import OpportunityListMobile from './mobile'
import './index.less'

const OpportunityList: React.FC = () => {
  const navigate = useNavigate()
  const { filter, setFilter, resetFilter } = useOpportunityStore()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<Opportunity[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<'planCompleteTime' | 'createTime' | 'lastUpdateTime'>('planCompleteTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [customerOptions, setCustomerOptions] = useState<Array<{ label: string; value: string }>>([])
  const [followerOptions, setFollowerOptions] = useState<Array<{ label: string; value: string }>>([])
  const [yearOptions, setYearOptions] = useState<number[]>([])
  const [optionConfig, setOptionConfig] = useState<{ importance: any[]; status: any[]; type: any[] }>({
    importance: [],
    status: [],
    type: [],
  })
  const [configModalVisible, setConfigModalVisible] = useState(false)

  // 获取客户选项
  useEffect(() => {
    getCustomerList({ pageSize: 1000 }).then((res) => {
      setCustomerOptions(res.list.map((item) => ({ label: item.name, value: item.id })))
    })
  }, [])

  // 获取跟进人选项
  useEffect(() => {
    getUserList().then((res) => {
      setFollowerOptions(res.map((item) => ({ label: item.name, value: item.id })))
    })
  }, [])

  // 生成年度选项（当前年及前后2年）
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i)
    }
    setYearOptions(years)
  }, [])

  // 加载选项配置
  useEffect(() => {
    loadOptionConfig()
  }, [])

  const loadOptionConfig = async () => {
    try {
      const config = await getOptionConfig()
      setOptionConfig(config)
    } catch (error) {
      console.error('加载选项配置失败', error)
    }
  }

  // 获取商机列表
  const fetchList = async () => {
    setLoading(true)
    try {
      const params = {
        ...filter,
        page,
        pageSize,
        sortField,
        sortOrder,
      }
      const res = await getOpportunityList(params)
      setDataSource(res.list)
      setTotal(res.total)
    } catch (error) {
      message.error('获取商机列表失败')
    } finally {
      setLoading(false)
    }
  }

  const isMobile = isH5()

  useEffect(() => {
    setPage(1)
    fetchList()
  }, [filter, sortField, sortOrder])

  const getImportanceTag = (importance: Opportunity['importance']) => {
    const option = optionConfig.importance.find((opt) => opt.value === importance)
    const color = importance === 'very-important' ? 'red' : 'orange'
    return <Tag color={color}>{option?.label || importance}</Tag>
  }

  const getStatusTag = (status: Opportunity['status']) => {
    const option = optionConfig.status.find((opt) => opt.value === status)
    const colorMap: Record<string, string> = {
      lost: 'default',
      won: 'success',
      'not-participate': 'warning',
      'in-progress': 'processing',
      'completed-visit': 'blue',
    }
    return <Tag color={colorMap[status]}>{option?.label || status}</Tag>
  }

  // 获取提醒标签
  const getReminderTag = (opportunity: Opportunity) => {
    if (!shouldShowReminder(opportunity.planCompleteTime)) {
      return null
    }
    const days = dayjs(opportunity.planCompleteTime).diff(dayjs().startOf('day'), 'day')
    const message = days === 0 
      ? '今天到期，请及时更新跟进情况' 
      : `距离计划完成时间还有${days}天，系统每天会推送企微消息提醒`
    
    return (
      <Tooltip title={message}>
        <Tag color="orange" icon={<BellOutlined />}>
          提醒中
        </Tag>
      </Tooltip>
    )
  }

  const columns: ColumnsType<Opportunity> = [
    {
      title: '事项',
      dataIndex: 'item',
      key: 'item',
      ellipsis: true,
      width: 200,
      render: (item: string, record: Opportunity) => (
        <Space>
          <span>{item}</span>
          {getReminderTag(record)}
        </Space>
      ),
    },
    {
      title: '客户',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 150,
    },
    {
      title: '重要程度',
      dataIndex: 'importance',
      key: 'importance',
      width: 120,
      render: (importance) => getImportanceTag(importance),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const option = optionConfig.type.find((opt) => opt.value === type)
        return option?.label || type
      },
    },
    {
      title: '跟进人',
      dataIndex: ['follower', 'name'],
      key: 'follower',
      width: 100,
    },
    {
      title: '计划完成时间',
      dataIndex: 'planCompleteTime',
      key: 'planCompleteTime',
      width: 150,
      render: (time) => formatDate(time, 'YYYY-MM-DD'),
      sorter: true,
      sortOrder: sortField === 'planCompleteTime' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
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
      ellipsis: true,
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (time) => formatDate(time, 'YYYY-MM-DD'),
      sorter: true,
      sortOrder: sortField === 'createTime' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
    },
    {
      title: '最近更新时间',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      width: 150,
      render: (time) => formatDate(time, 'YYYY-MM-DD'),
      sorter: true,
      sortOrder: sortField === 'lastUpdateTime' ? (sortOrder === 'asc' ? 'ascend' : 'descend') : null,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/opportunity/detail/${record.id}`)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/opportunity/edit/${record.id}`)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  if (isMobile) {
    return <OpportunityListMobile />
  }

  return (
    <div className="opportunity-list-page">
        <Card>
          <div className="page-header">
            <h2 className="page-title">商机列表</h2>
            <div className="page-actions">
              <Button
                type="default"
                icon={<SettingOutlined />}
                onClick={() => setConfigModalVisible(true)}
                style={{ marginRight: 8 }}
              >
                条件配置
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/opportunity/edit')}>
                新增商机
              </Button>
            </div>
          </div>

          <OpportunityFilter
            filter={filter}
            onFilterChange={setFilter}
            onReset={resetFilter}
            customerOptions={customerOptions}
            followerOptions={followerOptions}
            yearOptions={yearOptions}
            importanceOptions={optionConfig.importance}
            statusOptions={optionConfig.status}
            typeOptions={optionConfig.type}
          />

          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey="id"
              onChange={(_, __, sorter: any) => {
                if (sorter && sorter.field) {
                  const order = sorter.order === 'ascend' ? 'asc' : 'desc'
                  const field = sorter.field as 'planCompleteTime' | 'createTime' | 'lastUpdateTime'
                  setSortField(field)
                  setSortOrder(order)
                }
              }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => {
                setPage(page)
                setPageSize(pageSize)
              },
            }}
            scroll={{ x: 1500 }}
          />
        </Card>

        <OptionConfigModal
          open={configModalVisible}
          onClose={() => setConfigModalVisible(false)}
          onSave={() => {
            loadOptionConfig()
            fetchList()
          }}
        />
    </div>
  )
}

export default OpportunityList

