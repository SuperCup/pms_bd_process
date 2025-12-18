import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Space, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { getCustomerDetail } from '@/api/customer'
import type { Customer } from '@/types'
import { formatDate } from '@/utils'
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

  return (
    <div className="customer-detail-page">
      <Card
        loading={loading}
        title={
          <Space>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
            <span>客户详情</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/customer/edit/${id}`)}>
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
          {customer.contact && <Descriptions.Item label="联系人">{customer.contact}</Descriptions.Item>}
          {customer.phone && <Descriptions.Item label="电话">{customer.phone}</Descriptions.Item>}
          {customer.address && <Descriptions.Item label="地址">{customer.address}</Descriptions.Item>}
          {customer.pmsCustomerId && (
            <Descriptions.Item label="PMS客户ID">{customer.pmsCustomerId}</Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间">{formatDate(customer.createTime)}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{formatDate(customer.updateTime)}</Descriptions.Item>
          {customer.description && (
            <Descriptions.Item label="备注" span={2}>
              {customer.description}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  )
}

export default CustomerDetail

