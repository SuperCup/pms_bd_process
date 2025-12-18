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

  // 移动端底部导航项
  const bottomNavItems = [
    { key: '/board/last-week', icon: <DashboardOutlined />, label: '看板' },
    { key: '/opportunity/list', icon: <ShoppingOutlined />, label: '商机' },
    { key: '/customer/list', icon: <TeamOutlined />, label: '客户' },
  ]

  const handleBottomNavClick = (key: string) => {
    navigate(key)
  }

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
            className="mobile-menu-button"
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
        <Content className={`app-content ${isMobileDevice ? 'mobile-content' : ''}`}>
          <Outlet />
        </Content>
      </AntLayout>

      {/* 移动端底部导航栏 */}
      {isMobileDevice && (
        <div className="mobile-bottom-nav">
          {bottomNavItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${selectedKeys.includes(item.key) ? 'active' : ''}`}
              onClick={() => handleBottomNavClick(item.key)}
            >
              <div className="nav-icon">{item.icon}</div>
              <div className="nav-label">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </AntLayout>
  )
}

export default Layout
