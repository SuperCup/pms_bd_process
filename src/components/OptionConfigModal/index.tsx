import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Table, Space, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getOptionConfig, saveOptionConfig, type OptionConfig, type OptionItem } from '@/api/optionConfig'

interface OptionConfigModalProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
}

type ConfigType = 'importance' | 'status' | 'type'

const configLabels: Record<ConfigType, string> = {
  importance: '重要程度',
  status: '状态',
  type: '类型',
}

const OptionConfigModal: React.FC<OptionConfigModalProps> = ({ open, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<OptionConfig>({
    importance: [],
    status: [],
    type: [],
  })
  const [editingItem, setEditingItem] = useState<{ type: ConfigType; index: number } | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      loadConfig()
    }
  }, [open])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const data = await getOptionConfig()
      setConfig(data)
      setEditingItem(null)
    } catch (error) {
      message.error('加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await saveOptionConfig(config)
      message.success('配置保存成功')
      onSave?.()
      onClose()
    } catch (error) {
      message.error('保存配置失败')
    }
  }

  const handleAdd = (type: ConfigType) => {
    const newItem: OptionItem = { label: '', value: '' }
    const newConfig = {
      ...config,
      [type]: [...config[type], newItem],
    }
    setConfig(newConfig)
    setEditingItem({ type, index: newConfig[type].length - 1 })
    form.setFieldsValue({ label: '', value: '' })
  }

  const handleEdit = (type: ConfigType, index: number) => {
    const item = config[type][index]
    setEditingItem({ type, index })
    // 编辑时，将value字段设为空，因为备注列现在不显示value内容
    form.setFieldsValue({
      label: item.label,
      value: '', // 备注字段在编辑时为空
    })
  }

  const handleSaveItem = () => {
    if (!editingItem) return

    form.validateFields().then((values) => {
      const { type, index } = editingItem
      const items = [...config[type]]
      
      // 如果没有提供value，则基于label生成一个唯一值（用于系统内部标识）
      if (!values.value || values.value.trim() === '') {
        // 生成一个基于时间的唯一值
        values.value = `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // 检查value是否重复
      const duplicateIndex = items.findIndex((item, idx) => idx !== index && item.value === values.value)
      if (duplicateIndex !== -1) {
        message.error('备注不能重复')
        return
      }

      items[index] = values
      setConfig({
        ...config,
        [type]: items,
      })
      setEditingItem(null)
      form.resetFields()
      message.success('保存成功')
    })
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    form.resetFields()
  }

  const handleDelete = (type: ConfigType, index: number) => {
    const items = config[type].filter((_, idx) => idx !== index)
    setConfig({
      ...config,
      [type]: items,
    })
    message.success('删除成功')
  }

  const renderTable = (type: ConfigType) => {
    const columns: ColumnsType<OptionItem> = [
      {
        title: '显示名称',
        dataIndex: 'label',
        key: 'label',
        width: '40%',
        render: (text, _record, index) => {
          if (editingItem?.type === type && editingItem?.index === index) {
            return (
              <Form.Item
                name="label"
                rules={[{ required: true, message: '请输入显示名称' }]}
                style={{ margin: 0 }}
              >
                <Input placeholder="请输入显示名称" />
              </Form.Item>
            )
          }
          return text
        },
      },
      {
        title: '备注',
        dataIndex: 'value',
        key: 'value',
        width: '40%',
        render: (_text, _record, index) => {
          if (editingItem?.type === type && editingItem?.index === index) {
            return (
              <Form.Item
                name="value"
                rules={[
                  { required: false, message: '请输入备注' },
                ]}
                style={{ margin: 0 }}
              >
                <Input placeholder="请输入备注" />
              </Form.Item>
            )
          }
          return <span>-</span>
        },
      },
      {
        title: '操作',
        key: 'action',
        width: '20%',
        render: (_text, _record, index) => {
          if (editingItem?.type === type && editingItem?.index === index) {
            return (
              <Space>
                <Button type="link" size="small" onClick={handleSaveItem}>
                  保存
                </Button>
                <Button type="link" size="small" onClick={handleCancelEdit}>
                  取消
                </Button>
              </Space>
            )
          }
          return (
            <Space>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(type, index)}
                disabled={!!editingItem}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除此项吗？"
                onConfirm={() => handleDelete(type, index)}
                disabled={!!editingItem}
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!!editingItem}
                >
                  删除
                </Button>
              </Popconfirm>
            </Space>
          )
        },
      },
    ]

    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4>{configLabels[type]}</h4>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(type)}
            disabled={!!editingItem}
          >
            添加
          </Button>
        </div>
        <Form form={form}>
          <Table
            columns={columns}
            dataSource={config[type]}
            rowKey={(_record, index) => `${type}-${index}`}
            pagination={false}
            size="small"
          />
        </Form>
      </div>
    )
  }

  return (
    <Modal
      title="条件配置"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={800}
      okText="保存"
      cancelText="取消"
      confirmLoading={loading}
    >
      {renderTable('importance')}
      {renderTable('status')}
      {renderTable('type')}
    </Modal>
  )
}

export default OptionConfigModal

