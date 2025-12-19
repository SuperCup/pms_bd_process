import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Select, Tag, Space, Card, message, Tabs } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getCustomerList } from '@/api/customer'
import type { Customer } from '@/types'
import { formatDate, isH5 } from '@/utils'
import './index.less'

const CustomerList: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [isKA, setIsKA] = useState<boolean | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<'all' | 'ka' | 'other'>('all')
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const isMobile = isH5()

  useEffect(() => {
    setPage(1)
    setDataSource([])
    fetchList()
  }, [keyword, isKA])

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

  // 移动端tab切换
  useEffect(() => {
    if (isH5()) {
      if (activeTab === 'ka') {
        setIsKA(true)
      } else if (activeTab === 'other') {
        setIsKA(false)
      } else {
        setIsKA(undefined)
      }
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
        setTotal(res.total)
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

  const columns: ColumnsType<Customer> = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'KA客户',
      dataIndex: 'isKA',
      key: 'isKA',
      width: 100,
      render: (isKA) => (isKA ? <Tag color="red">KA</Tag> : '-'),
    },
    {
      title: '联系人',
      dataIndex: 'contacts',
      key: 'contacts',
      width: 120,
      render: (contacts) => {
        if (!contacts || contacts.length === 0) return '-'
        return contacts[0].name + (contacts.length > 1 ? ` 等${contacts.length}人` : '')
      },
    },
    {
      title: '电话',
      dataIndex: 'contacts',
      key: 'phone',
      width: 150,
      render: (contacts) => {
        if (!contacts || contacts.length === 0 || !contacts[0].phone) return '-'
        return contacts[0].phone
      },
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
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/customer/detail/${record.id}`)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/customer/edit/${record.id}`)}>
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
    )
  }

  return (
    <div className="customer-list-page">
      {isMobile ? (
        <>
          <div className="page-header">
            <h2 className="page-title">客户列表</h2>
          </div>
          {renderMobileView()}
        </>
      ) : (
        <Card>
          <div className="page-header">
            <h2 className="page-title">客户列表</h2>
            <div className="page-actions">
              <Space>
                <Input
                  placeholder="搜索客户名称"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  style={{ width: 200 }}
                  allowClear
                />
                <Select
                  placeholder="KA客户"
                  value={isKA}
                  onChange={setIsKA}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Select.Option value={true}>是</Select.Option>
                  <Select.Option value={false}>否</Select.Option>
                </Select>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  搜索
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/customer/edit')}>
                  新增客户
                </Button>
              </Space>
            </div>
          </div>

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
            scroll={{ x: 1000 }}
          />
        </Card>
      )}
    </div>
  )
}

export default CustomerList

