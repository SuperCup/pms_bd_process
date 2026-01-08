import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { Card, Button, Timeline, Space, message, Modal, Input, Form, Select, DatePicker } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { getOpportunityDetail, addProgressRecord, getProgressRecords, updateOpportunity } from '@/api/opportunity'
import { getCustomerList } from '@/api/customer'
import { getUserList } from '@/api/user'
import type { Opportunity, ProgressRecord, Customer, User } from '@/types'
import { formatDate } from '@/utils'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import dayjs from 'dayjs'
import '../index.less'

const { TextArea } = Input
const { Option } = Select

const OpportunityDetailMobile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [progressHistory, setProgressHistory] = useState<ProgressRecord[]>([])
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [progressContent, setProgressContent] = useState('')
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([])
  const [followerOptions, setFollowerOptions] = useState<User[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const initialValuesRef = useRef<any>(null)

  useEffect(() => {
    if (id) {
      fetchCustomers()
      fetchFollowers()
      fetchDetail()
      fetchProgressHistory()
    }
  }, [id])

  // 阻止导航（如果有未保存的更改）
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      Modal.confirm({
        title: '提示',
        content: '您有未保存的更改，确定要离开吗？',
        okText: '确定离开',
        cancelText: '取消',
        onOk: () => {
          setHasUnsavedChanges(false)
          blocker.proceed()
        },
        onCancel: () => {
          blocker.reset()
        },
      })
    }
  }, [blocker])

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
      setOpportunity(res)
      
      // 设置表单初始值
      const initialValues = {
        item: res.item,
        customerId: res.customer.id,
        importance: res.importance,
        type: res.type,
        followerId: res.follower.id,
        planCompleteTime: dayjs(res.planCompleteTime),
        status: res.status,
        progress: res.progress,
        relatedDocs: res.relatedDocs || [],
      }
      form.setFieldsValue(initialValues)
      initialValuesRef.current = initialValues
      setHasUnsavedChanges(false)
    } catch (error) {
      message.error('获取商机详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      
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

      await updateOpportunity(id!, data)
      message.success('保存成功')
      setHasUnsavedChanges(false)
      initialValuesRef.current = form.getFieldsValue()
      fetchDetail()
    } catch (error: any) {
      if (error?.errorFields) {
        message.error('请检查表单填写')
      } else {
        message.error('保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '提示',
        content: '您有未保存的更改，确定要离开吗？',
        okText: '确定离开',
        cancelText: '取消',
        onOk: () => {
          setHasUnsavedChanges(false)
          navigate(-1)
        },
      })
    } else {
      navigate(-1)
    }
  }

  const fetchProgressHistory = async () => {
    try {
      const res = await getProgressRecords(id!)
      setProgressHistory(res)
    } catch (error) {
      console.error('获取跟进记录失败', error)
    }
  }

  const handleAddProgress = async () => {
    if (!progressContent.trim()) {
      message.warning('请输入跟进内容')
      return
    }

    try {
      await addProgressRecord(id!, progressContent)
      message.success('添加跟进记录成功')
      setProgressModalVisible(false)
      setProgressContent('')
      fetchDetail()
      fetchProgressHistory()
    } catch (error) {
      message.error('添加跟进记录失败')
    }
  }

  if (!opportunity) {
    return <div>加载中...</div>
  }

  return (
    <div className="opportunity-detail-page">
      <Card
        loading={loading}
        title={
          <div className="card-title-wrapper">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="back-button">
            </Button>
            <span className="card-title-text">商机详情</span>
            <div className="card-title-placeholder" />
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => {
            const currentValues = form.getFieldsValue()
            if (initialValuesRef.current) {
              const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(initialValuesRef.current)
              setHasUnsavedChanges(hasChanges)
            }
          }}
        >
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
            label="重要程度"
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

          <Form.Item name="progress" label="最新进展">
            <TextArea rows={3} placeholder="请输入进展" />
          </Form.Item>

          {/* 只读时间信息 */}
          <div className="readonly-info-section">
            <div className="info-item">
              <span className="info-label">创建时间：</span>
              <span className="info-value">{formatDate(opportunity.createTime)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">最后更新时间：</span>
              <span className="info-value">{formatDate(opportunity.lastUpdateTime)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">创建年度：</span>
              <span className="info-value">{opportunity.createYear}年</span>
            </div>
            <div className="info-item">
              <span className="info-label">创建月份：</span>
              <span className="info-value">{opportunity.createMonth}月</span>
            </div>
          </div>
        </Form>

        <div className="progress-section">
          <div className="section-header">
            <h3>跟进记录</h3>
          </div>
          <Timeline>
            {progressHistory.map((record) => (
              <Timeline.Item key={record.id}>
                <div className="progress-item">
                  <div className="progress-content">{record.content}</div>
                  <div className="progress-meta">
                    <span>{record.creator.name}</span>
                    <span>{formatDate(record.createTime)}</span>
                  </div>
                </div>
              </Timeline.Item>
            ))}
            {progressHistory.length === 0 && <div className="empty-progress">暂无跟进记录</div>}
          </Timeline>
        </div>
      </Card>

      {/* 固定底部按钮 */}
      <div className="mobile-fixed-bottom">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            block
            onClick={handleSave}
            loading={saving}
            size="large"
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? '保存更改' : '已保存'}
          </Button>
          <Button
            icon={<PlusOutlined />}
            block
            onClick={() => setProgressModalVisible(true)}
            size="large"
          >
            添加跟进记录
          </Button>
        </Space>
      </div>

      <Modal
        title="添加跟进记录"
        open={progressModalVisible}
        onOk={handleAddProgress}
        onCancel={() => {
          setProgressModalVisible(false)
          setProgressContent('')
        }}
      >
        <Input.TextArea
          rows={6}
          value={progressContent}
          onChange={(e) => setProgressContent(e.target.value)}
          placeholder="请输入跟进内容"
        />
      </Modal>
    </div>
  )
}

export default OpportunityDetailMobile

