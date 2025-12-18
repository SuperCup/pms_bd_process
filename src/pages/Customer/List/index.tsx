import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Select, Tag, Space, Card, message } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
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

  useEffect(() => {
    fetchList()
  }, [page, pageSize, keyword, isKA])

  const fetchList = async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        pageSize,
      }
      if (keyword) {
        params.keyword = keyword
      }
      if (isKA !== undefined) {
        params.isKA = isKA
      }
      const res = await getCustomerList(params)
      setDataSource(res.list)
      setTotal(res.total)
    } catch (error) {
      message.error('获取客户列表失败')
    } finally {
      setLoading(false)
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

  const isMobile = isH5()

  // 移动端卡片视图
  const renderMobileView = () => {
    return (
      <div className="mobile-list-view">
        <div className="mobile-list-header">
          <Input
            placeholder="搜索客户名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ marginBottom: 12 }}
            allowClear
          />
          <Space style={{ width: '100%', marginBottom: 12 }} direction="vertical">
            <Select
              placeholder="KA客户"
              value={isKA}
              onChange={setIsKA}
              style={{ width: '100%' }}
              allowClear
            >
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />} block onClick={handleSearch}>
              搜索
            </Button>
            <Button type="primary" icon={<PlusOutlined />} block onClick={() => navigate('/customer/edit')}>
              新增客户
            </Button>
          </Space>
        </div>

        <div className="mobile-card-list">
          {dataSource.map((item) => (
            <Card
              key={item.id}
              className="mobile-customer-card"
              onClick={() => navigate(`/customer/detail/${item.id}`)}
            >
              <div className="card-header">
                <div className="card-title">{item.name}</div>
                {item.isKA && <Tag color="red">KA</Tag>}
              </div>
              <div className="card-content">
                {item.contacts && item.contacts.length > 0 && (
                  <div className="card-row">
                    <span className="card-label">联系人：</span>
                    <span className="card-value">
                      {item.contacts[0].name}
                      {item.contacts.length > 1 && ` 等${item.contacts.length}人`}
                    </span>
                  </div>
                )}
                {item.contacts && item.contacts.length > 0 && item.contacts[0].phone && (
                  <div className="card-row">
                    <span className="card-label">电话：</span>
                    <span className="card-value">{item.contacts[0].phone}</span>
                  </div>
                )}
                <div className="card-row">
                  <span className="card-label">创建时间：</span>
                  <span className="card-value">{formatDate(item.createTime, 'YYYY-MM-DD')}</span>
                </div>
              </div>
              <div className="card-actions">
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/customer/detail/${item.id}`)
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
                    navigate(`/customer/edit/${item.id}`)
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
    <div className="customer-list-page">
      <Card>
        <div className="page-header">
          <h2 className="page-title">客户列表</h2>
          {!isMobile && (
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
          )}
        </div>

        {isMobile ? (
          renderMobileView()
        ) : (
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
        )}
      </Card>
    </div>
  )
}

export default CustomerList

