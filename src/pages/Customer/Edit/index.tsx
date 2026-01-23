import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Switch, Button, Card, message, Space, Select } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getCustomerDetail, createCustomer, updateCustomer, checkCustomerDuplicate } from '@/api/customer'
import { getUserList } from '@/api/user'
import type { Customer, User } from '@/types'
import { isH5 } from '@/utils'
import PMSCustomerSelect from '@/components/PMSCustomerSelect'
import CustomerContactList from '@/components/CustomerContactList'
import './index.less'

const { Option } = Select


const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [vpOptions, setVpOptions] = useState<User[]>([])

  const isEdit = !!id

  useEffect(() => {
    fetchVpOptions()
    if (isEdit && id) {
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

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getCustomerDetail(id!)
      form.setFieldsValue({
        name: res.name,
        code: res.code,
        isKA: res.isKA,
        pmsCustomer: res.pmsCustomer,
        customerType: res.customerType,
        mainVP: res.mainVP,
        contacts: res.contacts || [],
      })
    } catch (error) {
      message.error('获取客户详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleNameBlur = async () => {
    const name = form.getFieldValue('name')
    if (!name || isEdit) return

    try {
      const res = await checkCustomerDuplicate(name)
      if (res.exists) {
        message.warning('该客户名称已存在，请检查或使用现有客户')
      }
    } catch (error) {
      console.error('检查客户重复失败', error)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const data: Partial<Customer> = {
        name: values.name,
        code: values.code,
        isKA: values.isKA || false,
        pmsCustomer: values.pmsCustomer,
        customerType: values.customerType,
        mainVP: values.mainVP,
        contacts: values.contacts || [],
      }

      if (isEdit) {
        await updateCustomer(id!, data)
        message.success('更新客户成功')
      } else {
        await createCustomer(data)
        message.success('创建客户成功')
      }
      navigate('/customer/list')
    } catch (error) {
      message.error(isEdit ? '更新客户失败' : '创建客户失败')
    } finally {
      setLoading(false)
    }
  }

  const isMobile = isH5()

  return (
    <div className="customer-edit-page">
      <Card
        loading={loading}
        title={
          <div className="card-title-wrapper">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} className="back-button">
              {isMobile ? '' : '返回'}
            </Button>
            <span className="card-title-text">{isEdit ? '编辑客户' : '新增客户'}</span>
            <div className="card-title-placeholder" />
          </div>
        }
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" onBlur={handleNameBlur} />
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
              <Select.Option value="key">重点客户</Select.Option>
              <Select.Option value="silent">沉默客户</Select.Option>
              <Select.Option value="new">新客户</Select.Option>
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

export default CustomerEdit

