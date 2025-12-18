import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Drawer, Button } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DashboardOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { isH5 } from '@/utils'
import './index.less'

const { Sider, Content } = AntLayout

const menuItems: MenuProps['items'] = [
  {
    key: '/board/last-week',
    icon: <DashboardOutlined />,
    label: '上周新增商机',
  },
  {
    key: '/board/ka',
    icon: <DashboardOutlined />,
    label: 'KA客户事项',
  },
  {
    key: '/opportunity/list',
    icon: <ShoppingOutlined />,
    label: '商机列表',
  },
  {
    key: '/customer/list',
    icon: <TeamOutlined />,
    label: '客户管理',
  },
  {
    key: '/reminder',
    icon: <BellOutlined />,
    label: '提醒设置',
  },
]

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isMobileDevice = isH5()

  useEffect(() => {
    if (isMobileDevice) {
      setCollapsed(true)
    }
  }, [isMobileDevice])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
    if (isMobileDevice) {
      setDrawerVisible(false)
    }
  }

  const selectedKeys = [location.pathname]

  const menuContent = (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ height: '100%', borderRight: 0 }}
    />
  )

  return (
    <AntLayout className="app-layout" style={{ minHeight: '100vh' }}>
      {isMobileDevice ? (
        <>
          <Drawer
            title="菜单"
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            bodyStyle={{ padding: 0 }}
          >
            {menuContent}
          </Drawer>
          <Button
            type="primary"
            icon={<MenuFoldOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ position: 'fixed', top: 16, left: 16, zIndex: 1000 }}
          />
        </>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed} width={200}>
          {menuContent}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%',
              height: 48,
              color: '#fff',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        </Sider>
      )}

      <AntLayout>
        <Content className="app-content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
