import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, message, Alert, Table } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { getCustomerDetail } from '@/api/customer'
import type { Customer } from '@/types'
import { formatDate, isH5 } from '@/utils'
import CustomerDetailMobile from './mobile'
import './index.less'

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const isMobile = isH5()

  useEffect(() => {
    if (id) {
      fetchDetail()
    }
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getCustomerDetail(id!)
      setCustomer(res)
    } catch (error) {
      message.error('获取客户详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (isMobile) {
    return <CustomerDetailMobile />
  }

  if (!customer) {
    return <div>加载中...</div>
  }

  return (
    <div className="customer-detail-page">
      <Card
        loading={loading}
        title={
          <div className="card-title-wrapper">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="back-button">
              返回
            </Button>
            <span className="card-title-text">客户详情</span>
            <div className="card-title-placeholder" />
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/customer/edit/${id}`)}
          >
            编辑
          </Button>
        }
      >
        <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
              <Descriptions.Item label="客户名称">{customer.name}</Descriptions.Item>
              <Descriptions.Item label="KA客户">
                {customer.isKA ? <Tag color="red">是</Tag> : <Tag>否</Tag>}
              </Descriptions.Item>
              {customer.code && <Descriptions.Item label="客户编码">{customer.code}</Descriptions.Item>}
              {customer.pmsCustomer && (
                <Descriptions.Item label="PMS客户">
                  {customer.pmsCustomer.shortName} {customer.pmsCustomer.fullName}
                </Descriptions.Item>
              )}
              {customer.address && <Descriptions.Item label="地址">{customer.address}</Descriptions.Item>}
              <Descriptions.Item label="创建时间">{formatDate(customer.createTime)}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{formatDate(customer.updateTime)}</Descriptions.Item>
            </Descriptions>

            {customer.contacts && customer.contacts.length > 0 && (
              <div className="contacts-section" style={{ marginTop: 24 }}>
                <Alert
                  message="联系人信息仅本人可见"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  dataSource={customer.contacts}
                  rowKey={(record, index) => record.id || `contact-${index}`}
                  pagination={false}
                  columns={[
                    {
                      title: '姓名',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: '电话',
                      dataIndex: 'phone',
                      key: 'phone',
                    },
                    {
                      title: '职位',
                      dataIndex: 'position',
                      key: 'position',
                    },
                    {
                      title: '备注',
                      dataIndex: 'remark',
                      key: 'remark',
                      ellipsis: true,
                    },
                  ]}
                />
              </div>
            )}
      </Card>
    </div>
  )
}

export default CustomerDetail

