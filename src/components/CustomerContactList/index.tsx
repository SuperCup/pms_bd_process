import { useState, useEffect } from 'react'
import { Input, Button, Table, Space, message, Select } from 'antd'
import { PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import type { CustomerContact } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import { INDUSTRY_OPTIONS, MAIN_BUSINESS_OPTIONS } from '@/utils/constants'
import { getUserList } from '@/api/user'
import type { User } from '@/types'
import './index.less'

const { Option } = Select

interface CustomerContactListProps {
  value?: CustomerContact[]
  onChange?: (contacts: CustomerContact[]) => void
}

const CustomerContactList: React.FC<CustomerContactListProps> = ({ value = [], onChange }) => {
  const [editingKey, setEditingKey] = useState<string>('')
  const [editingRow, setEditingRow] = useState<Partial<CustomerContact>>({})
  const [directorManagerOptions, setDirectorManagerOptions] = useState<User[]>([])

  useEffect(() => {
    fetchDirectorManagers()
  }, [])

  const fetchDirectorManagers = async () => {
    try {
      const res = await getUserList()
      setDirectorManagerOptions(res)
    } catch (error) {
      console.error('获取客户总监/经理列表失败', error)
    }
  }

  const handleAdd = () => {
    const newContact: CustomerContact = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      departmentBrand: '',
      industry: '',
      directorManager: '',
      mainBusiness: '',
    }
    onChange?.([...value, newContact])
    setEditingKey(newContact.id)
    setEditingRow(newContact)
  }

  const handleEdit = (record: CustomerContact) => {
    setEditingKey(record.id)
    // 确保mainBusiness是数组格式
    const mainBusiness = record.mainBusiness
    const mainBusinessArray = Array.isArray(mainBusiness) ? mainBusiness : (mainBusiness ? [mainBusiness] : [])
    setEditingRow({ ...record, mainBusiness: mainBusinessArray })
  }

  const handleSave = (id: string) => {
    if (!editingRow.departmentBrand?.trim()) {
      message.warning('请输入部门/品牌')
      return
    }
    
    // 校验部门/品牌名称重复性（排除当前编辑的记录）
    const duplicate = value.find(item => 
      item.id !== id && 
      item.departmentBrand?.trim() === editingRow.departmentBrand?.trim() &&
      item.departmentBrand?.trim() !== ''
    )
    if (duplicate) {
      message.warning('该部门/品牌名称已存在，请使用其他名称')
      return
    }
    
    const newContacts = value.map(item => 
      item.id === id ? { ...item, ...editingRow } : item
    )
    onChange?.(newContacts)
    setEditingKey('')
    setEditingRow({})
    message.success('保存成功')
  }

  const handleCancel = () => {
    setEditingKey('')
    setEditingRow({})
  }

  const handleDelete = (id: string) => {
    const newContacts = value.filter(item => item.id !== id)
    onChange?.(newContacts)
    message.success('删除成功')
  }

  const handleFieldChange = (field: keyof CustomerContact, val: string | string[]) => {
    setEditingRow({ ...editingRow, [field]: val })
  }

  const isEditing = (record: CustomerContact) => record.id === editingKey

  const columns: ColumnsType<CustomerContact> = [
    {
      title: '部门/品牌',
      dataIndex: 'departmentBrand',
      key: 'departmentBrand',
      width: '25%',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Input
              value={editingRow.departmentBrand}
              onChange={(e) => handleFieldChange('departmentBrand', e.target.value)}
              placeholder="请输入部门/品牌"
              autoFocus
            />
          )
        }
        return <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{text || '-'}</div>
      },
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: '20%',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Select
              value={editingRow.industry}
              onChange={(val) => handleFieldChange('industry', val)}
              placeholder="请选择行业"
              showSearch
              allowClear
              filterOption={(input, option) => {
                const label = typeof option?.label === 'string' ? option.label : String(option?.label || '')
                return label.toLowerCase().includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
            >
              {INDUSTRY_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          )
        }
        return <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{text || '-'}</div>
      },
    },
    {
      title: '跟进客户总监/经理',
      dataIndex: 'directorManager',
      key: 'directorManager',
      width: '20%',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Select
              value={editingRow.directorManager}
              onChange={(val) => handleFieldChange('directorManager', val)}
              placeholder="请选择跟进客户总监/经理"
              showSearch
              allowClear
              filterOption={(input, option) => {
                const label = typeof option?.label === 'string' ? option.label : String(option?.label || '')
                return label.toLowerCase().includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
            >
              {directorManagerOptions.map(user => (
                <Option key={user.id} value={user.name}>
                  {user.name} ({user.bu})
                </Option>
              ))}
            </Select>
          )
        }
        return <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{text || '-'}</div>
      },
    },
    {
      title: '主要业务',
      dataIndex: 'mainBusiness',
      key: 'mainBusiness',
      width: '25%',
      render: (text, record) => {
        if (isEditing(record)) {
          const currentValue = editingRow.mainBusiness
          const selectValue = Array.isArray(currentValue) ? currentValue : (currentValue ? [currentValue] : [])
          return (
            <Select
              value={selectValue}
              onChange={(val) => handleFieldChange('mainBusiness', val)}
              placeholder="请选择主要业务"
              showSearch
              allowClear
              mode="multiple"
              filterOption={(input, option) => {
                const label = typeof option?.label === 'string' ? option.label : String(option?.label || '')
                return label.toLowerCase().includes(input.toLowerCase())
              }}
              style={{ width: '100%' }}
            >
              {MAIN_BUSINESS_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          )
        }
        const displayText = Array.isArray(text) ? text.join(', ') : text
        return <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{displayText || '-'}</div>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '10%',
      render: (_, record) => {
        if (isEditing(record)) {
          return (
            <Space>
              <Button
                type="link"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(record.id)}
              >
                保存
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              >
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
              onClick={() => handleEdit(record)}
              disabled={!!editingKey}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              disabled={!!editingKey}
            >
              删除
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <div className="customer-contact-list">
      <Table
        columns={columns}
        dataSource={value}
        rowKey="id"
        pagination={false}
        size="small"
        footer={() => (
          <div style={{ textAlign: 'left', padding: '8px 0' }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!!editingKey}
              block
            >
              添加部门/品牌
            </Button>
          </div>
        )}
      />
    </div>
  )
}

export default CustomerContactList
