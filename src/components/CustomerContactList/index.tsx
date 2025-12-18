import { Input, Button, Card, Alert } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { CustomerContact } from '@/types'
import { isH5 } from '@/utils'
import './index.less'

interface CustomerContactListProps {
  value?: CustomerContact[]
  onChange?: (contacts: CustomerContact[]) => void
}

const CustomerContactList: React.FC<CustomerContactListProps> = ({ value = [], onChange }) => {
  const isMobile = isH5()

  const handleAdd = () => {
    const newContact: CustomerContact = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: '',
      phone: '',
      position: '',
      remark: '',
    }
    onChange?.([...value, newContact])
  }

  const handleRemove = (index: number) => {
    const newContacts = value.filter((_, i) => i !== index)
    onChange?.(newContacts)
  }

  const handleFieldChange = (index: number, field: keyof CustomerContact, val: string) => {
    const newContacts = [...value]
    newContacts[index] = { ...newContacts[index], [field]: val }
    onChange?.(newContacts)
  }

  return (
    <div className="customer-contact-list">
      <Alert
        message="联系人信息仅本人可见"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        closable={false}
      />
      <div className="contact-list">
        {value.map((contact, index) => (
          <Card key={contact.id} size="small" className="contact-card" style={{ marginBottom: 12 }}>
            <div className="contact-header">
              <span className="contact-index">联系人 {index + 1}</span>
              {value.length > 0 && (
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(index)}
                >
                  删除
                </Button>
              )}
            </div>
            <div className="contact-fields">
              <div className="field-row">
                <Input
                  placeholder="姓名"
                  value={contact.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  size={isMobile ? 'large' : 'middle'}
                />
              </div>
              <div className="field-row">
                <Input
                  placeholder="电话"
                  value={contact.phone}
                  onChange={(e) => handleFieldChange(index, 'phone', e.target.value)}
                  size={isMobile ? 'large' : 'middle'}
                />
              </div>
              <div className="field-row">
                <Input
                  placeholder="职位"
                  value={contact.position}
                  onChange={(e) => handleFieldChange(index, 'position', e.target.value)}
                  size={isMobile ? 'large' : 'middle'}
                />
              </div>
              <div className="field-row">
                <Input.TextArea
                  placeholder="备注"
                  value={contact.remark}
                  onChange={(e) => handleFieldChange(index, 'remark', e.target.value)}
                  rows={2}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        block={isMobile}
        style={{ marginTop: 8 }}
      >
        添加联系人
      </Button>
    </div>
  )
}

export default CustomerContactList

