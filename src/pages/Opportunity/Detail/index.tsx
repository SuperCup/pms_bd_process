import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Timeline, Space, message, Modal, Input } from 'antd'
import { ArrowLeftOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { getOpportunityDetail, addProgressRecord, getProgressRecords } from '@/api/opportunity'
import type { Opportunity, ProgressRecord } from '@/types'
import { formatDate, isH5 } from '@/utils'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import './index.less'

const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [progressHistory, setProgressHistory] = useState<ProgressRecord[]>([])
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [progressContent, setProgressContent] = useState('')

  useEffect(() => {
    if (id) {
      fetchDetail()
      fetchProgressHistory()
    }
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getOpportunityDetail(id!)
      setOpportunity(res)
    } catch (error) {
      message.error('获取商机详情失败')
    } finally {
      setLoading(false)
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

  const isMobile = isH5()

  return (
    <div className="opportunity-detail-page">
      <Card
        loading={loading}
        title={
          <Space>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {isMobile ? '' : '返回'}
            </Button>
            <span>商机详情</span>
          </Space>
        }
        extra={
          <Button
            type={isMobile ? 'default' : 'primary'}
            icon={<EditOutlined />}
            onClick={() => navigate(`/opportunity/edit/${id}`)}
            size={isMobile ? 'small' : 'middle'}
          >
            编辑
          </Button>
        }
      >
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
      </Card>

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

