import { useState, useEffect } from 'react'
import { Card, Table, Button, message, Modal, Form, Input, Switch, Select, Space, Tag, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getReminderRules, createReminderRule, updateReminderRule, deleteReminderRule } from '@/api/reminder'
import type { ReminderRule } from '@/types'
import { WEEKDAY_MAP } from '@/utils/constants'
import './index.less'

const { TextArea } = Input
const { Option } = Select

const Reminder: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<ReminderRule[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getReminderRules()
      setDataSource(res)
    } catch (error) {
      message.error('获取提醒规则失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingRule(null)
    form.resetFields()
    form.setFieldsValue({
      enabled: true,
      triggerDays: [1, 3, 5], // 默认周一、三、五
      beforeDays: 3,
    })
    setModalVisible(true)
  }

  const handleEdit = (rule: ReminderRule) => {
    setEditingRule(rule)
    form.setFieldsValue({
      name: rule.name,
      triggerDays: rule.triggerDays,
      beforeDays: rule.beforeDays,
      message: rule.message,
      enabled: rule.enabled,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提醒规则吗？',
      onOk: async () => {
        try {
          await deleteReminderRule(id)
          message.success('删除成功')
          fetchData()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingRule) {
        await updateReminderRule(editingRule.id, values)
        message.success('更新提醒规则成功')
      } else {
        await createReminderRule(values)
        message.success('创建提醒规则成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      message.error(editingRule ? '更新提醒规则失败' : '创建提醒规则失败')
    }
  }

  const columns: ColumnsType<ReminderRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '触发日期',
      dataIndex: 'triggerDays',
      key: 'triggerDays',
      render: (days: number[]) => (
        <Space wrap>
          {days.map((day) => (
            <Tag key={day}>{WEEKDAY_MAP[day as keyof typeof WEEKDAY_MAP]}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '提前天数',
      dataIndex: 'beforeDays',
      key: 'beforeDays',
      render: (days) => `${days} 天`,
    },
    {
      title: '提醒内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="reminder-page">
      <Card>
        <div className="page-header">
          <h2 className="page-title">提醒设置</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增提醒规则
          </Button>
        </div>

        <Table columns={columns} dataSource={dataSource} loading={loading} rowKey="id" />

        <Modal
          title={editingRule ? '编辑提醒规则' : '新增提醒规则'}
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => setModalVisible(false)}
          width={600}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="name"
              label="规则名称"
              rules={[{ required: true, message: '请输入规则名称' }]}
            >
              <Input placeholder="请输入规则名称" />
            </Form.Item>

            <Form.Item
              name="triggerDays"
              label="触发日期"
              rules={[{ required: true, message: '请选择触发日期' }]}
            >
              <Select mode="multiple" placeholder="请选择触发日期">
                {Object.entries(WEEKDAY_MAP).map(([key, label]) => (
                  <Option key={key} value={Number(key)}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="beforeDays"
              label="提前天数"
              rules={[{ required: true, message: '请输入提前天数' }]}
            >
              <InputNumber min={0} placeholder="请输入提前天数" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="message"
              label="提醒内容"
              rules={[{ required: true, message: '请输入提醒内容' }]}
            >
              <TextArea rows={4} placeholder="请输入提醒内容" />
            </Form.Item>

            <Form.Item name="enabled" label="启用状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  )
}

export default Reminder

