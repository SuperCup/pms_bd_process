import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button } from 'antd'
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
  // 初始值使用函数形式，确保在客户端正确检测
  const [isMobileDevice, setIsMobileDevice] = useState(() => {
    if (typeof window !== 'undefined') {
      return isH5()
    }
    return false
  })
  const navigate = useNavigate()
  const location = useLocation()

  // 检测移动端并监听窗口大小变化
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(isH5())
    }
    
    // 初始检测（延迟一帧确保DOM已渲染）
    const timer = setTimeout(() => {
      checkMobile()
    }, 0)
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (isMobileDevice) {
      setCollapsed(true)
    }
  }, [isMobileDevice])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  // 匹配底部导航的选中状态
  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/board')) return '/board'
    if (path.startsWith('/opportunity')) return '/opportunity/list'
    if (path.startsWith('/customer')) return '/customer/list'
    return path
  }
  const selectedKeys = [getSelectedKey()]

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
    { key: '/board', icon: <DashboardOutlined />, label: '看板' },
    { key: '/opportunity/list', icon: <ShoppingOutlined />, label: '商机' },
    { key: '/customer/list', icon: <TeamOutlined />, label: '客户' },
  ]

  const handleBottomNavClick = (key: string) => {
    navigate(key)
  }

  // 判断是否应该显示底部导航栏（详情页和编辑页不显示）
  const shouldShowBottomNav = isMobileDevice && 
    !location.pathname.includes('/detail/') && 
    !location.pathname.includes('/edit')

  return (
    <AntLayout className="app-layout" style={{ minHeight: '100vh' }}>
      {!isMobileDevice && (
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
        <Content className={`app-content ${isMobileDevice ? 'mobile-content' : ''} ${isMobileDevice && location.pathname.includes('/detail/') ? 'detail-page' : ''}`}>
          <Outlet />
        </Content>
      </AntLayout>

      {/* 移动端底部导航栏 */}
      {shouldShowBottomNav && (
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
