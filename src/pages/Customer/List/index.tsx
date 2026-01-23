import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Select, Tag, Space, Card, message, Modal, Row, Col, Form } from 'antd'
import { PlusOutlined, EyeOutlined, SearchOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getCustomerList } from '@/api/customer'
import { getUserList } from '@/api/user'
import type { Customer, User } from '@/types'
import { formatDate, isH5 } from '@/utils'
import CustomerListMobile from './mobile'
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
  const [mainVP, setMainVP] = useState<string | undefined>(undefined)
  const [customerType, setCustomerType] = useState<string | undefined>(undefined)
  const [vpOptions, setVpOptions] = useState<User[]>([])
  const [departmentBrandModalVisible, setDepartmentBrandModalVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const isMobile = isH5()

  useEffect(() => {
    fetchVpOptions()
  }, [])

  const fetchVpOptions = async () => {
    try {
      const res = await getUserList()
      setVpOptions(res)
    } catch (error) {
      console.error('获取VP列表失败', error)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchList()
  }, [keyword, isKA, mainVP, customerType])

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
      if (mainVP) {
        params.mainVP = mainVP
      }
      if (customerType) {
        params.customerType = customerType
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

  const getCustomerTypeTag = (type?: string) => {
    if (!type) return '-'
    const typeMap: Record<string, { label: string; color: string }> = {
      'key': { label: '重点客户', color: 'red' },
      'silent': { label: '沉默客户', color: 'orange' },
      'new': { label: '新客户', color: 'green' },
    }
    const typeInfo = typeMap[type]
    return typeInfo ? <Tag color={typeInfo.color}>{typeInfo.label}</Tag> : '-'
  }

  const getVpName = (vpId?: string) => {
    if (!vpId) return '-'
    const vp = vpOptions.find(u => u.id === vpId)
    return vp ? vp.name : '-'
  }

  const handleExport = async () => {
    try {
      message.loading({ content: '正在导出...', key: 'export' })
      // 获取所有客户数据（不分页）
      const allCustomersRes = await getCustomerList({ pageSize: 10000, keyword, isKA, mainVP, customerType })
      const exportData: any[] = []
      
      allCustomersRes.list.forEach(customer => {
        if (customer.contacts && customer.contacts.length > 0) {
          customer.contacts.forEach((contact) => {
            exportData.push({
              '客户/厂牌简称': customer.name,
              '类型': customer.customerType === 'key' ? '重点客户' : customer.customerType === 'silent' ? '沉默客户' : customer.customerType === 'new' ? '新客户' : '',
              'K/A VP': getVpName(customer.mainVP),
              '行业': contact.industry || '',
              '部门/品牌': contact.departmentBrand || '',
              '客户总监/经理': contact.directorManager || '',
            })
          })
        } else {
          // 如果没有部门/品牌，也导出一行
          exportData.push({
            '客户/厂牌简称': customer.name,
            '类型': customer.customerType === 'key' ? '重点客户' : customer.customerType === 'silent' ? '沉默客户' : customer.customerType === 'new' ? '新客户' : '',
            'K/A VP': getVpName(customer.mainVP),
            '行业': '',
            '部门/品牌': '',
            '客户总监/经理': '',
          })
        }
      })

      // 转换为CSV格式
      const headers = ['客户/厂牌简称', '类型', 'K/A VP', '行业', '部门/品牌', '客户总监/经理']
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header] || ''
            // 处理包含逗号或引号的值
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      // 添加BOM以支持中文
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `客户列表_${formatDate(new Date().toISOString(), 'YYYY-MM-DD')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success({ content: '导出成功', key: 'export' })
    } catch (error) {
      message.error({ content: '导出失败', key: 'export' })
    }
  }

  const handleShowDepartmentBrand = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDepartmentBrandModalVisible(true)
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
      title: '主要负责人（VP）',
      dataIndex: 'mainVP',
      key: 'mainVP',
      width: 150,
      render: (vpId) => {
        const vp = vpOptions.find(u => u.id === vpId)
        return vp ? `${vp.name} (${vp.bu})` : '-'
      },
    },
    {
      title: '客户类型',
      dataIndex: 'customerType',
      key: 'customerType',
      width: 120,
      render: (type) => getCustomerTypeTag(type),
    },
    {
      title: '部门/品牌',
      key: 'departmentBrand',
      width: 120,
      render: (_, record) => {
        const count = record.contacts?.length || 0
        if (count === 0) {
          return '-'
        }
        return (
          <Button
            type="link"
            onClick={() => handleShowDepartmentBrand(record)}
            style={{ padding: 0 }}
          >
            {count}个
          </Button>
        )
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
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/customer/detail/${record.id}`)}>
          详情
        </Button>
      ),
    },
  ]

  if (isMobile) {
    return <CustomerListMobile />
  }

  return (
    <div className="customer-list-page">
        <Card>
          <div className="page-header">
            <h2 className="page-title">客户列表</h2>
            <div className="page-actions">
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/customer/edit')}>
                新增客户
              </Button>
            </div>
          </div>

          {/* 筛选区域 */}
          <Form layout="vertical" onFinish={handleSearch}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="客户名称">
                  <Input
                    placeholder="请输入客户名称"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={handleSearch}
                    allowClear
                    prefix={<SearchOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="KA客户">
                  <Select
                    placeholder="请选择KA客户"
                    value={isKA}
                    onChange={setIsKA}
                    allowClear
                  >
                    <Select.Option value={true}>是</Select.Option>
                    <Select.Option value={false}>否</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="主要负责人（VP）">
                  <Select
                    placeholder="请选择主要负责人"
                    value={mainVP}
                    onChange={setMainVP}
                    showSearch
                    allowClear
                    filterOption={(input, option) => {
                      const label = typeof option?.label === 'string' ? option.label : String(option?.label || '')
                      return label.toLowerCase().includes(input.toLowerCase())
                    }}
                  >
                    {vpOptions.map(user => (
                      <Select.Option key={user.id} value={user.id}>
                        {user.name} ({user.bu})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item label="客户类型">
                  <Select
                    placeholder="请选择客户类型"
                    value={customerType}
                    onChange={setCustomerType}
                    allowClear
                  >
                    <Select.Option value="key">重点客户</Select.Option>
                    <Select.Option value="silent">沉默客户</Select.Option>
                    <Select.Option value="new">新客户</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24}>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      搜索
                    </Button>
                    <Button onClick={() => {
                      setKeyword('')
                      setIsKA(undefined)
                      setMainVP(undefined)
                      setCustomerType(undefined)
                      setPage(1)
                      setTimeout(() => fetchList(), 0)
                    }} icon={<ReloadOutlined />}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>

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

        {/* 部门/品牌弹窗 */}
        <Modal
          title={`${selectedCustomer?.name} - 部门/品牌详情`}
          open={departmentBrandModalVisible}
          onCancel={() => setDepartmentBrandModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDepartmentBrandModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={800}
        >
          {selectedCustomer && selectedCustomer.contacts && selectedCustomer.contacts.length > 0 ? (
            <Table
              dataSource={selectedCustomer.contacts}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '部门/品牌',
                  dataIndex: 'departmentBrand',
                  key: 'departmentBrand',
                },
                {
                  title: '行业',
                  dataIndex: 'industry',
                  key: 'industry',
                },
                {
                  title: '客户总监/经理',
                  dataIndex: 'directorManager',
                  key: 'directorManager',
                },
                {
                  title: '主要业务',
                  dataIndex: 'mainBusiness',
                  key: 'mainBusiness',
                  render: (text) => {
                    if (Array.isArray(text)) {
                      return text.join(', ')
                    }
                    return text || '-'
                  },
                },
              ]}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>暂无部门/品牌信息</div>
          )}
        </Modal>
    </div>
  )
}

export default CustomerList

