import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, Card, message, Input, Tabs } from 'antd'
import { PlusOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons'
import { getCustomerList } from '@/api/customer'
import type { Customer } from '@/types'
import '../index.less'

const CustomerListMobile: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<Customer[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [isKA, setIsKA] = useState<boolean | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<'all' | 'ka' | 'other'>('all')
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setPage(1)
    setDataSource([])
    fetchList()
  }, [keyword, isKA])

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

  // 移动端tab切换
  useEffect(() => {
    if (activeTab === 'ka') {
      setIsKA(true)
    } else if (activeTab === 'other') {
      setIsKA(false)
    } else {
      setIsKA(undefined)
    }
  }, [activeTab])

  const fetchList = async (append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    try {
      const params: any = {
        page: append ? page + 1 : page,
        pageSize,
      }
      if (keyword) {
        params.keyword = keyword
      }
      if (isKA !== undefined) {
        params.isKA = isKA
      }
      const res = await getCustomerList(params)
      if (append) {
        setDataSource([...dataSource, ...res.list])
        setPage(page + 1)
        setHasMore(res.list.length === pageSize && dataSource.length + res.list.length < res.total)
      } else {
        setDataSource(res.list)
        setHasMore(res.list.length === pageSize && res.list.length < res.total)
      }
    } catch (error) {
      message.error('获取客户列表失败')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchList()
  }

  return (
    <div className="customer-list-page">
      <div className="page-header">
        <h2 className="page-title">客户列表</h2>
      </div>
      <div className="mobile-list-view">
        <div className="mobile-list-header">
          <Input
            placeholder="搜索客户名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
            style={{ marginBottom: 12 }}
            onPressEnter={handleSearch}
          />
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'all' | 'ka' | 'other')}
            items={[
              { key: 'all', label: '全部' },
              { key: 'ka', label: 'KA' },
              { key: 'other', label: '其他' },
            ]}
            className="customer-tabs"
          />
        </div>

        <div className="mobile-card-list">
          {dataSource.map((item) => (
            <Card
              key={item.id}
              className="mobile-customer-card"
              onClick={() => navigate(`/customer/detail/${item.id}`)}
            >
              <div className="card-row-item">
                <div className="card-main">
                  <div className="card-title-row">
                    <div className="card-title" title={item.name}>
                      {item.name}
                    </div>
                    {item.isKA && <Tag color="red">KA</Tag>}
                  </div>
                  {item.contacts && item.contacts.length > 0 && (
                    <div className="card-subtitle">
                      {item.contacts[0].name}
                      {item.contacts.length > 1 && ` 等${item.contacts.length}人`}
                    </div>
                  )}
                </div>
                <RightOutlined className="card-arrow" />
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
          onClick={() => navigate('/customer/edit')}
          shape="circle"
          size="large"
        />
      </div>
    </div>
  )
}

export default CustomerListMobile

