import { useState, useEffect } from 'react'
import { Card, Table, Button, message, Modal, Switch, Space, Tag } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getPermissionConfig, getFieldConfig, updateFieldConfig } from '@/api/permission'
import type { Permission, FieldConfig, UserRole } from '@/types'
import { ROLE_OPTIONS } from '@/utils/constants'
import { isH5 } from '@/utils'
import './index.less'

const Permission: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [fieldConfigModalVisible, setFieldConfigModalVisible] = useState(false)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getPermissionConfig()
      setPermissions(res)
    } catch (error) {
      message.error('获取权限配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEditFieldConfig = async (role: UserRole) => {
    setCurrentRole(role)
    try {
      const res = await getFieldConfig(role)
      setFieldConfigs(res)
      setFieldConfigModalVisible(true)
    } catch (error) {
      message.error('获取字段配置失败')
    }
  }

  const handleSaveFieldConfig = async () => {
    if (!currentRole) return

    try {
      await updateFieldConfig(currentRole, fieldConfigs)
      message.success('保存字段配置成功')
      setFieldConfigModalVisible(false)
      fetchData()
    } catch (error) {
      message.error('保存字段配置失败')
    }
  }

  const handleToggleFieldVisible = (index: number) => {
    const newConfigs = [...fieldConfigs]
    newConfigs[index].visible = !newConfigs[index].visible
    setFieldConfigs(newConfigs)
  }

  const handleToggleFieldEditable = (index: number) => {
    const newConfigs = [...fieldConfigs]
    newConfigs[index].editable = !newConfigs[index].editable
    setFieldConfigs(newConfigs)
  }

  const columns: ColumnsType<Permission> = [
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const option = ROLE_OPTIONS.find((opt) => opt.value === role)
        return option?.label
      },
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.map((perm) => (
            <Tag key={perm}>{perm}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '字段配置数量',
      key: 'fieldConfigCount',
      render: (_, record) => record.fieldConfigs.length,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEditFieldConfig(record.role)}>
          配置字段
        </Button>
      ),
    },
  ]

  const isMobile = isH5()

  // 移动端卡片视图
  const renderMobileView = () => {
    return (
      <div className="mobile-list-view">
        {permissions.map((permission) => (
          <Card key={permission.role} className="mobile-permission-card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              <div className="card-title">
                {ROLE_OPTIONS.find((opt) => opt.value === permission.role)?.label}
              </div>
            </div>
            <div className="card-content">
              <div className="card-row">
                <span className="card-label">权限：</span>
                <div className="card-value">
                  <Space wrap>
                    {permission.permissions.map((perm) => (
                      <Tag key={perm}>{perm}</Tag>
                    ))}
                  </Space>
                </div>
              </div>
              <div className="card-row">
                <span className="card-label">字段配置：</span>
                <span className="card-value">{permission.fieldConfigs.length} 个</span>
              </div>
            </div>
            <div className="card-actions">
              <Button
                type="primary"
                block
                icon={<EditOutlined />}
                onClick={() => handleEditFieldConfig(permission.role)}
              >
                配置字段
              </Button>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="permission-page">
      <Card>
        <div className="page-header">
          <h2 className="page-title">权限管理</h2>
        </div>

        {isMobile ? (
          renderMobileView()
        ) : (
          <Table
            columns={columns}
            dataSource={permissions}
            loading={loading}
            rowKey="role"
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title={`字段配置 - ${ROLE_OPTIONS.find((opt) => opt.value === currentRole)?.label}`}
        open={fieldConfigModalVisible}
        onOk={handleSaveFieldConfig}
        onCancel={() => setFieldConfigModalVisible(false)}
        width={isMobile ? '90%' : 800}
      >
        <div className="field-config-list">
          {fieldConfigs.map((config, index) => (
            <Card key={index} size="small" style={{ marginBottom: 16 }}>
              <div className="field-config-item">
                <div className="field-info">
                  <div className="field-name">{config.displayName}</div>
                  <div className="field-key">{config.fieldName}</div>
                </div>
                <div className="field-controls">
                  <Space>
                    <Switch
                      checked={config.visible}
                      onChange={() => handleToggleFieldVisible(index)}
                      checkedChildren="可见"
                      unCheckedChildren="隐藏"
                    />
                    <Switch
                      checked={config.editable}
                      onChange={() => handleToggleFieldEditable(index)}
                      checkedChildren="可编辑"
                      unCheckedChildren="只读"
                    />
                    <Tag color={config.required ? 'red' : 'default'}>
                      {config.required ? '必填' : '选填'}
                    </Tag>
                  </Space>
                </div>
              </div>
              {config.options && config.options.length > 0 && (
                <div className="field-options">
                  <div className="options-label">预选项：</div>
                  <Space wrap>
                    {config.options.map((opt, optIndex) => (
                      <Tag key={optIndex}>{opt}</Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default Permission

