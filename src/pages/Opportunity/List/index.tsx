import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Space, Card, message, Select, Tooltip } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, BellOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import OpportunityFilter from '@/components/OpportunityFilter'
import { getOpportunityList } from '@/api/opportunity'
import { getUserList } from '@/api/user'
import { getCustomerList } from '@/api/customer'
import { useOpportunityStore } from '@/stores/opportunityStore'
import type { Opportunity } from '@/types'
import { formatDate, isH5, shouldShowReminder } from '@/utils'
import dayjs from 'dayjs'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS, SORT_OPTIONS } from '@/utils/constants'
import './index.less'

const OpportunityList: React.FC = () => {
  const navigate = useNavigate()
  const { filter, setFilter, resetFilter } = useOpportunityStore()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<Opportunity[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState('planCompleteTime_asc')
  const [customerOptions, setCustomerOptions] = useState<Array<{ label: string; value: string }>>([])
  const [followerOptions, setFollowerOptions] = useState<Array<{ label: string; value: string }>>([])
  const [yearOptions, setYearOptions] = useState<number[]>([])

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

  // 获取商机列表
  const fetchList = async () => {
    setLoading(true)
    try {
      const [sortField, sortOrder] = sort.split('_')
      const params = {
        ...filter,
        page,
        pageSize,
        sortField,
        sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
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

  useEffect(() => {
    fetchList()
  }, [filter, page, pageSize, sort])

  const getImportanceTag = (importance: Opportunity['importance']) => {
    const option = IMPORTANCE_OPTIONS.find((opt) => opt.value === importance)
    const color = importance === 'very-important' ? 'red' : 'orange'
    return <Tag color={color}>{option?.label}</Tag>
  }

  const getStatusTag = (status: Opportunity['status']) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    const colorMap: Record<string, string> = {
      lost: 'default',
      won: 'success',
      'not-participate': 'warning',
      'in-progress': 'processing',
      'completed-visit': 'blue',
    }
    return <Tag color={colorMap[status]}>{option?.label}</Tag>
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
        const option = TYPE_OPTIONS.find((opt) => opt.value === type)
        return option?.label
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

  const isMobile = isH5()

  // 移动端卡片视图
  const renderMobileView = () => {
    return (
      <div className="mobile-list-view">
        <div className="mobile-list-header">
          <Select
            value={sort}
            onChange={setSort}
            style={{ width: '100%', marginBottom: 12 }}
            options={SORT_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            onClick={() => navigate('/opportunity/edit')}
            style={{ marginBottom: 12 }}
          >
            新增商机
          </Button>
        </div>

        <OpportunityFilter
          filter={filter}
          onFilterChange={setFilter}
          onReset={resetFilter}
          customerOptions={customerOptions}
          followerOptions={followerOptions}
          yearOptions={yearOptions}
        />

        <div className="mobile-card-list">
          {dataSource.map((item) => (
            <Card
              key={item.id}
              className="mobile-opportunity-card"
              onClick={() => navigate(`/opportunity/detail/${item.id}`)}
            >
              <div className="card-header">
                <div className="card-title">
                  <Space>
                    <span>{item.item}</span>
                    {getReminderTag(item)}
                  </Space>
                </div>
                <div className="card-tags">
                  {getImportanceTag(item.importance)}
                  {getStatusTag(item.status)}
                </div>
              </div>
              <div className="card-content">
                <div className="card-row">
                  <span className="card-label">客户：</span>
                  <span className="card-value">{item.customer.name}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">跟进人：</span>
                  <span className="card-value">{item.follower.name}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">类型：</span>
                  <span className="card-value">
                    {TYPE_OPTIONS.find((opt) => opt.value === item.type)?.label}
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">计划完成：</span>
                  <span className="card-value">{formatDate(item.planCompleteTime, 'YYYY-MM-DD')}</span>
                </div>
                {item.progress && (
                  <div className="card-row">
                    <span className="card-label">进展：</span>
                    <span className="card-value card-progress">{item.progress}</span>
                  </div>
                )}
              </div>
              <div className="card-actions">
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/opportunity/detail/${item.id}`)
                  }}
                >
                  详情
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/opportunity/edit/${item.id}`)
                  }}
                >
                  编辑
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mobile-pagination">
          <div className="pagination-info">共 {total} 条</div>
          <Space>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <span>
              {page} / {Math.ceil(total / pageSize)}
            </span>
            <Button
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </Space>
        </div>
      </div>
    )
  }

  return (
    <div className="opportunity-list-page">
      <Card>
        <div className="page-header">
          <h2 className="page-title">商机列表</h2>
          {!isMobile && (
            <div className="page-actions">
              <Space>
                <Select
                  value={sort}
                  onChange={setSort}
                  style={{ width: 200 }}
                  options={SORT_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/opportunity/edit')}>
                  新增商机
                </Button>
              </Space>
            </div>
          )}
        </div>

        {isMobile ? (
          renderMobileView()
        ) : (
          <>
            <OpportunityFilter
              filter={filter}
              onFilterChange={setFilter}
              onReset={resetFilter}
              customerOptions={customerOptions}
              followerOptions={followerOptions}
              yearOptions={yearOptions}
            />

            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey="id"
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
          </>
        )}
      </Card>
    </div>
  )
}

export default OpportunityList

