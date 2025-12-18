import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Select, Tag, Space, Card, message } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getCustomerList } from '@/api/customer'
import type { Customer } from '@/types'
import { formatDate } from '@/utils'
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
      dataIndex: 'contact',
      key: 'contact',
      width: 120,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
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

  return (
    <div className="customer-list-page">
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
    </div>
  )
}

export default CustomerList

