import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Card, message, Input } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, BellOutlined, SearchOutlined } from '@ant-design/icons'
import OpportunityFilterMobile from '@/components/OpportunityFilterMobile'
import { getOpportunityList } from '@/api/opportunity'
import { getUserList } from '@/api/user'
import { getCustomerList } from '@/api/customer'
import { useOpportunityStore } from '@/stores/opportunityStore'
import type { Opportunity } from '@/types'
import { formatDate, shouldShowReminder } from '@/utils'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import '../index.less'

const OpportunityListMobile: React.FC = () => {
  const navigate = useNavigate()
  const { filter, setFilter, resetFilter } = useOpportunityStore()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<Opportunity[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
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
        setHasMore(res.list.length === pageSize && res.list.length < res.total)
      }
    } catch (error) {
      message.error('获取商机列表失败')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setDataSource([])
    fetchList()
  }, [filter, sortField, sortOrder])

  // 移动端无限滚动
  useEffect(() => {
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
  }, [hasMore, loadingMore, loading, dataSource.length])

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
    return (
      <Tag color="orange" icon={<BellOutlined />}>
        提醒中
      </Tag>
    )
  }

  return (
    <div className="opportunity-list-page">
      <div className="page-header">
        <h2 className="page-title">商机列表</h2>
      </div>
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
    </div>
  )
}

export default OpportunityListMobile

