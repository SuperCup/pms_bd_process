import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Space, message, Alert, Table } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { getCustomerDetail } from '@/api/customer'
import type { Customer } from '@/types'
import { formatDate, isH5 } from '@/utils'
import './index.less'

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

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

  if (!customer) {
    return <div>加载中...</div>
  }

  const isMobile = isH5()

  return (
    <div className="customer-detail-page">
      <Card
        loading={loading}
        title={
          <Space>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {isMobile ? '' : '返回'}
            </Button>
            <span>客户详情</span>
          </Space>
        }
        extra={
          <Button
            type={isMobile ? 'default' : 'primary'}
            icon={<EditOutlined />}
            onClick={() => navigate(`/customer/edit/${id}`)}
            size={isMobile ? 'small' : 'middle'}
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
            {isMobile ? (
              <div className="mobile-contact-list">
                {customer.contacts.map((contact, index) => (
                  <Card key={contact.id || index} size="small" style={{ marginBottom: 12 }}>
                    <div className="contact-item">
                      <div className="contact-header">
                        <span className="contact-name">{contact.name || `联系人 ${index + 1}`}</span>
                        {contact.position && <Tag>{contact.position}</Tag>}
                      </div>
                      {contact.phone && (
                        <div className="contact-row">
                          <span className="label">电话：</span>
                          <span className="value">{contact.phone}</span>
                        </div>
                      )}
                      {contact.remark && (
                        <div className="contact-row">
                          <span className="label">备注：</span>
                          <span className="value">{contact.remark}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default CustomerDetail

