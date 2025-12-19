import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Timeline, Space, message, Modal, Input, Form, Select, DatePicker } from 'antd'
import { ArrowLeftOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { getOpportunityDetail, addProgressRecord, getProgressRecords, updateOpportunity } from '@/api/opportunity'
import { getCustomerList } from '@/api/customer'
import { getUserList } from '@/api/user'
import type { Opportunity, ProgressRecord, Customer, User } from '@/types'
import { formatDate, isH5 } from '@/utils'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import dayjs from 'dayjs'
import './index.less'

const { TextArea } = Input
const { Option } = Select

const OpportunityDetail: React.FC = () => {
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
  const isMobile = isH5()

  useEffect(() => {
    if (id) {
      fetchCustomers()
      fetchFollowers()
      fetchDetail()
      fetchProgressHistory()
    }
  }, [id])

  // 阻止导航（如果有未保存的更改）- 仅移动端
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isMobile && hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
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
      
      // 移动端设置表单初始值
      if (isMobile) {
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
      }
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

  const getImportanceTag = (importance: Opportunity['importance']) => {
    const option = IMPORTANCE_OPTIONS.find((opt) => opt.value === importance)
    const color = importance === 'very-important' ? 'red' : 'orange'
    return <Tag color={color}>{option?.label}</Tag>
  }

  const getStatusTag = (status: Opportunity['status']) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    const colorMap: Record<string, string> = {
      lost: 'default',
      won: 'success',
      'not-participate': 'warning',
      'in-progress': 'processing',
      'completed-visit': 'blue',
    }
    return <Tag color={colorMap[status]}>{option?.label}</Tag>
  }

  // 移动端可编辑表单视图
  const renderMobileForm = () => {
    if (!opportunity) return null

    return (
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
    )
  }

  return (
    <div className="opportunity-detail-page">
      <Card
        loading={loading}
        title={
          <div className="card-title-wrapper">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="back-button">
              {isMobile ? '' : '返回'}
            </Button>
            <span className="card-title-text">商机详情</span>
            <div className="card-title-placeholder" />
          </div>
        }
        extra={
          !isMobile && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/opportunity/edit/${id}`)}
            >
              编辑
            </Button>
          )
        }
      >
        {isMobile ? (
          <>
            {renderMobileForm()}
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
          </>
        ) : (
          <>
            <Descriptions column={{ xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered>
              <Descriptions.Item label="事项">{opportunity.item}</Descriptions.Item>
              <Descriptions.Item label="客户">{opportunity.customer.name}</Descriptions.Item>
              <Descriptions.Item label="重要程度">{getImportanceTag(opportunity.importance)}</Descriptions.Item>
              <Descriptions.Item label="类型">
                {TYPE_OPTIONS.find((opt) => opt.value === opportunity.type)?.label}
              </Descriptions.Item>
              <Descriptions.Item label="跟进人">{opportunity.follower.name}</Descriptions.Item>
              <Descriptions.Item label="计划完成时间">{formatDate(opportunity.planCompleteTime, 'YYYY-MM-DD')}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(opportunity.status)}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatDate(opportunity.createTime)}</Descriptions.Item>
              <Descriptions.Item label="最后更新时间">{formatDate(opportunity.lastUpdateTime)}</Descriptions.Item>
              <Descriptions.Item label="创建年度">{opportunity.createYear}年</Descriptions.Item>
              <Descriptions.Item label="创建月份">{opportunity.createMonth}月</Descriptions.Item>
              <Descriptions.Item label="相关文档" span={3}>
                {opportunity.relatedDocs && opportunity.relatedDocs.length > 0 ? (
                  <Space>
                    {opportunity.relatedDocs.map((doc, index) => (
                      <a key={index} href={doc} target="_blank" rel="noopener noreferrer">
                        文档{index + 1}
                      </a>
                    ))}
                  </Space>
                ) : (
                  '暂无'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="最新进展" span={3}>
                {opportunity.progress || '暂无'}
              </Descriptions.Item>
            </Descriptions>
            <div className="progress-section">
              <div className="section-header">
                <h3>跟进记录</h3>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setProgressModalVisible(true)}>
                  添加跟进
                </Button>
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
          </>
        )}

      </Card>

      {/* 移动端固定底部按钮 */}
      {isMobile && (
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
      )}

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

export default OpportunityDetail

