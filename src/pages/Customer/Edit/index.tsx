import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, Switch, Button, Card, message, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getCustomerDetail, createCustomer, updateCustomer, checkCustomerDuplicate } from '@/api/customer'
import type { Customer } from '@/types'
import './index.less'

const { TextArea } = Input

const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const isEdit = !!id

  useEffect(() => {
    if (isEdit && id) {
      fetchDetail()
    }
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getCustomerDetail(id!)
      form.setFieldsValue({
        name: res.name,
        code: res.code,
        isKA: res.isKA,
        contact: res.contact,
        phone: res.phone,
        address: res.address,
        description: res.description,
        pmsCustomerId: res.pmsCustomerId,
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
        contact: values.contact,
        phone: values.phone,
        address: values.address,
        description: values.description,
        pmsCustomerId: values.pmsCustomerId,
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

  return (
    <div className="customer-edit-page">
      <Card
        loading={loading}
        title={
          <Space>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
            <span>{isEdit ? '编辑客户' : '新增客户'}</span>
          </Space>
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

          <Form.Item name="contact" label="联系人">
            <Input placeholder="请输入联系人" />
          </Form.Item>

          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>

          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>

          <Form.Item name="pmsCustomerId" label="PMS客户ID">
            <Input placeholder="请输入PMS客户ID（关联）" />
          </Form.Item>

          <Form.Item name="description" label="备注">
            <TextArea rows={4} placeholder="请输入备注" />
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

