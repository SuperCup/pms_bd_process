import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Space, Card, message, Tooltip, Input } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, BellOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import OpportunityFilter from '@/components/OpportunityFilter'
import OpportunityFilterMobile from '@/components/OpportunityFilterMobile'
import { getOpportunityList } from '@/api/opportunity'
import { getUserList } from '@/api/user'
import { getCustomerList } from '@/api/customer'
import { useOpportunityStore } from '@/stores/opportunityStore'
import type { Opportunity } from '@/types'
import { formatDate, isH5, shouldShowReminder } from '@/utils'
import dayjs from 'dayjs'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
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
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
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
  const fetchList = async (append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    try {
      const params = {
        ...filter,
        page: append ? page + 1 : page,
        pageSize,
        sortField,
        sortOrder,
      }
      const res = await getOpportunityList(params)
      if (append) {
        setDataSource([...dataSource, ...res.list])
        setPage(page + 1)
        setHasMore(res.list.length === pageSize && dataSource.length + res.list.length < res.total)
      } else {
        setDataSource(res.list)
        setTotal(res.total)
        setHasMore(res.list.length === pageSize && res.list.length < res.total)
      }
    } catch (error) {
      message.error('获取商机列表失败')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const isMobile = isH5()

  useEffect(() => {
    setPage(1)
    setDataSource([])
    fetchList()
  }, [filter, sortField, sortOrder])

  // 移动端无限滚动
  useEffect(() => {
    if (!isMobile) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 距离底部100px时加载更多
      if (scrollTop + windowHeight >= documentHeight - 100 && hasMore && !loadingMore && !loading) {
        fetchList(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile, hasMore, loadingMore, loading, dataSource.length])

  // 切换排序（移动端使用）
  const handleSortChange = (field: 'planCompleteTime' | 'lastUpdateTime') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

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

  // 移动端卡片视图
  const renderMobileView = () => {
    return (
      <div className="mobile-list-view">
        <div className="mobile-list-header">
          <div className="mobile-search-filter-row">
            <Input
              placeholder="搜索事项关键词"
              value={filter.keyword}
              onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
              prefix={<SearchOutlined />}
              allowClear
              style={{ flex: 1 }}
              onPressEnter={() => fetchList()}
            />
            <OpportunityFilterMobile
              filter={filter}
              onFilterChange={setFilter}
              onReset={resetFilter}
              customerOptions={customerOptions}
              followerOptions={followerOptions}
              yearOptions={yearOptions}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        <div className="mobile-card-list">
          {dataSource.map((item) => (
            <Card
              key={item.id}
              className="mobile-opportunity-card"
            >
              <div className="card-header">
                <div className="card-title-row">
                  <div className="card-title" title={item.item}>
                    {item.item}
                  </div>
                  <div className="card-tags">
                    {getReminderTag(item)}
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="card-tags-row">
                  {getImportanceTag(item.importance)}
                  {getStatusTag(item.status)}
                </div>
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
              <div className="card-actions-bottom">
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/opportunity/detail/${item.id}`)}
                >
                  详情
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/opportunity/edit/${item.id}`)}
                >
                  编辑
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {loadingMore && (
          <div className="mobile-loading-more">
            <div>加载中...</div>
          </div>
        )}

        {!hasMore && dataSource.length > 0 && (
          <div className="mobile-loading-more">
            <div>没有更多了</div>
          </div>
        )}

        {/* 底部悬浮新增按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="mobile-fab-button"
          onClick={() => navigate('/opportunity/edit')}
          shape="circle"
          size="large"
        />
      </div>
    )
  }

  return (
    <div className="opportunity-list-page">
      {isMobile ? (
        <>
          <div className="page-header">
            <h2 className="page-title">商机列表</h2>
          </div>
          {renderMobileView()}
        </>
      ) : (
        <Card>
          <div className="page-header">
            <h2 className="page-title">商机列表</h2>
            <div className="page-actions">
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
      )}
    </div>
  )
}

export default OpportunityList

