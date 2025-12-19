import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Select, DatePicker, Button, Card, message, Upload, Space } from 'antd'
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getOpportunityDetail, createOpportunity, updateOpportunity } from '@/api/opportunity'
import { getCustomerList } from '@/api/customer'
import { getUserList } from '@/api/user'
import type { Opportunity, Customer, User } from '@/types'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import { formatDate, isH5 } from '@/utils'
import './index.less'

const { TextArea } = Input
const { Option } = Select

const OpportunityEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([])
  const [followerOptions, setFollowerOptions] = useState<User[]>([])

  const isEdit = !!id

  useEffect(() => {
    fetchCustomers()
    fetchFollowers()
    if (isEdit && id) {
      fetchDetail()
    }
  }, [id])

  const fetchCustomers = async () => {
    try {
      const res = await getCustomerList({ pageSize: 1000 })
      setCustomerOptions(res.list)
    } catch (error) {
      console.error('获取客户列表失败', error)
    }
  }

  const fetchFollowers = async () => {
    try {
      const res = await getUserList()
      setFollowerOptions(res)
    } catch (error) {
      console.error('获取跟进人列表失败', error)
    }
  }

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getOpportunityDetail(id!)
      form.setFieldsValue({
        item: res.item,
        customerId: res.customer.id,
        importance: res.importance,
        type: res.type,
        followerId: res.follower.id,
        planCompleteTime: dayjs(res.planCompleteTime),
        status: res.status,
        progress: res.progress,
        relatedDocs: res.relatedDocs,
      })
    } catch (error) {
      message.error('获取商机详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const data: Partial<Opportunity> = {
        item: values.item,
        customer: { id: values.customerId } as Customer,
        importance: values.importance,
        type: values.type,
        follower: { id: values.followerId } as User,
        planCompleteTime: formatDate(values.planCompleteTime, 'YYYY-MM-DD'),
        status: values.status,
        progress: values.progress,
        relatedDocs: values.relatedDocs || [],
      }

      if (isEdit) {
        await updateOpportunity(id!, data)
        message.success('更新商机成功')
      } else {
        await createOpportunity(data)
        message.success('创建商机成功')
      }
      navigate('/opportunity/list')
    } catch (error) {
      message.error(isEdit ? '更新商机失败' : '创建商机失败')
    } finally {
      setLoading(false)
    }
  }

  const isMobile = isH5()

  return (
    <div className="opportunity-edit-page">
      <Card
        loading={loading}
        title={
          <div className="card-title-wrapper">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="back-button">
              {isMobile ? '' : '返回'}
            </Button>
            <span className="card-title-text">{isEdit ? '编辑商机' : '新增商机'}</span>
            <div className="card-title-placeholder" />
          </div>
        }
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ status: 'in-progress' }}>
          <Form.Item
            name="item"
            label="事项"
            rules={[{ required: true, message: '请输入事项' }]}
          >
            <Input placeholder="请输入事项" />
          </Form.Item>

          <Form.Item
            name="customerId"
            label="客户"
            rules={[{ required: true, message: '请选择客户' }]}
          >
            <Select
              placeholder="请选择客户"
              showSearch
              filterOption={(input, option) => {
                const label = typeof option?.label === 'string' ? option.label : String(option?.label || '')
                return label.toLowerCase().includes(input.toLowerCase())
              }}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      type="link"
                      block
                      onClick={() => {
                        // 跳转到客户创建页面
                        navigate('/customer/edit')
                      }}
                    >
                      + 创建新客户
                    </Button>
                  </div>
                </>
              )}
            >
              {customerOptions.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} {customer.isKA && '(KA)'}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="importance"
            label="事项重要程度"
            rules={[{ required: true, message: '请选择重要程度' }]}
          >
            <Select placeholder="请选择重要程度">
              {IMPORTANCE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              {TYPE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="followerId"
            label="跟进人"
            rules={[{ required: true, message: '请选择跟进人' }]}
          >
            <Select placeholder="请选择跟进人">
              {followerOptions.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.bu})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="planCompleteTime"
            label="计划完成时间"
            rules={[{ required: true, message: '请选择计划完成时间' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择计划完成时间" />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态">
              {STATUS_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="progress" label="进展">
            <TextArea rows={4} placeholder="请输入进展" />
          </Form.Item>

          <Form.Item name="relatedDocs" label="相关文档">
            <Upload
              action="/api/upload"
              listType="text"
              maxCount={5}
            >
              <Button icon={<UploadOutlined />}>上传文档</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              <Button onClick={() => navigate(-1)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default OpportunityEdit

