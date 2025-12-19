import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, message, Alert, Table, Form, Input, Switch, Modal } from 'antd'
import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { getCustomerDetail, updateCustomer } from '@/api/customer'
import PMSCustomerSelect from '@/components/PMSCustomerSelect'
import CustomerContactList from '@/components/CustomerContactList'
import type { Customer } from '@/types'
import { formatDate, isH5 } from '@/utils'
import './index.less'

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const initialValuesRef = useRef<any>(null)
  const isMobile = isH5()

  useEffect(() => {
    if (id) {
      fetchDetail()
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

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getCustomerDetail(id!)
      setCustomer(res)
      
      // 移动端设置表单初始值
      if (isMobile) {
        const initialValues = {
          name: res.name,
          code: res.code,
          isKA: res.isKA,
          pmsCustomer: res.pmsCustomer,
          contacts: res.contacts || [],
        }
        form.setFieldsValue(initialValues)
        initialValuesRef.current = initialValues
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      message.error('获取客户详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      
      const data: Partial<Customer> = {
        name: values.name,
        code: values.code,
        isKA: values.isKA || false,
        pmsCustomer: values.pmsCustomer,
        contacts: values.contacts || [],
      }

      await updateCustomer(id!, data)
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

  // 移动端可编辑表单视图
  const renderMobileForm = () => {
    if (!customer) return null

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
          name="name"
          label="客户名称"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input placeholder="请输入客户名称" />
        </Form.Item>

        <Form.Item name="code" label="客户编码">
          <Input placeholder="请输入客户编码" />
        </Form.Item>

        <Form.Item name="isKA" label="KA客户" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="pmsCustomer" label="PMS客户">
          <PMSCustomerSelect />
        </Form.Item>

        <Form.Item name="contacts" label="联系人">
          <CustomerContactList />
        </Form.Item>

        {/* 只读时间信息 */}
        <div className="readonly-info-section">
          <div className="info-item">
            <span className="info-label">创建时间：</span>
            <span className="info-value">{formatDate(customer.createTime)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">更新时间：</span>
            <span className="info-value">{formatDate(customer.updateTime)}</span>
          </div>
        </div>
      </Form>
    )
  }

  if (!customer) {
    return <div>加载中...</div>
  }

  return (
    <div className="customer-detail-page">
      <Card
        loading={loading}
        title={
          <div className="card-title-wrapper">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} className="back-button">
              {isMobile ? '' : '返回'}
            </Button>
            <span className="card-title-text">客户详情</span>
            <div className="card-title-placeholder" />
          </div>
        }
        extra={
          !isMobile && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/customer/edit/${id}`)}
            >
              编辑
            </Button>
          )
        }
      >
        {isMobile ? (
          renderMobileForm()
        ) : (
          <>
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
              </div>
            )}
          </>
        )}
      </Card>

      {/* 移动端固定底部按钮 */}
      {isMobile && (
        <div className="mobile-fixed-bottom">
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
        </div>
      )}
    </div>
  )
}

export default CustomerDetail

