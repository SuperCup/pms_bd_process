import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, message, Modal, Form, Input, Switch, Select, Table } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { getCustomerDetail, updateCustomer } from '@/api/customer'
import { getUserList } from '@/api/user'
import PMSCustomerSelect from '@/components/PMSCustomerSelect'
import CustomerContactList from '@/components/CustomerContactList'
import type { Customer, User } from '@/types'
import { formatDate, isH5 } from '@/utils'
import CustomerDetailMobile from './mobile'
import './index.less'

const { Option } = Select

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [vpOptions, setVpOptions] = useState<User[]>([])
  const initialValuesRef = useRef<any>(null)
  const isMobile = isH5()

  useEffect(() => {
    fetchVpOptions()
    if (id) {
      fetchDetail()
    }
  }, [id])

  const fetchVpOptions = async () => {
    try {
      const res = await getUserList()
      setVpOptions(res)
    } catch (error) {
      console.error('获取VP列表失败', error)
    }
  }

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

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getCustomerDetail(id!)
      setCustomer(res)
      
      // 设置表单初始值
      const initialValues = {
        name: res.name,
        code: res.code,
        isKA: res.isKA,
        pmsCustomer: res.pmsCustomer,
        customerType: res.customerType,
        mainVP: res.mainVP,
        contacts: res.contacts || [],
      }
      form.setFieldsValue(initialValues)
      initialValuesRef.current = initialValues
      setHasUnsavedChanges(false)
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
        customerType: values.customerType,
        mainVP: values.mainVP,
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

  if (isMobile) {
    return <CustomerDetailMobile />
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
              返回
            </Button>
            <span className="card-title-text">客户详情</span>
            <div className="card-title-placeholder" />
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? '保存更改' : '已保存'}
          </Button>
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
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item name="pmsCustomer" label="PMS客户">
            <PMSCustomerSelect placeholder="请选择PMS客户" />
          </Form.Item>

          <Form.Item name="customerType" label="客户类型">
            <Select placeholder="请选择客户类型">
              <Option value="key">重点客户</Option>
              <Option value="silent">沉默客户</Option>
              <Option value="new">新客户</Option>
            </Select>
          </Form.Item>

          <Form.Item name="mainVP" label="主要负责人（VP）">
            <Select placeholder="请选择主要负责人（VP）" showSearch filterOption={(input, option) => {
              const label = typeof option?.label === 'string' ? option.label : String(option?.label || '')
              return label.toLowerCase().includes(input.toLowerCase())
            }}>
              {vpOptions.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.bu})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="contacts" label="部门/品牌">
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
      </Card>
    </div>
  )
}

export default CustomerDetail

