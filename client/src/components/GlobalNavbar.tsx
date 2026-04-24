import React, { useState, useEffect } from 'react';
import { Layout, Typography, Space, Button, Avatar, Dropdown, Menu, Drawer } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import { 
  UserOutlined, LogoutOutlined, DashboardOutlined,
  HeartOutlined, RocketOutlined, MenuOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

const GlobalNavbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileVisible, setMobileVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding') {
    return null;
  }

  const navItems = [
    { label: 'Mobility', path: '/mobility' },
    { label: 'Network', path: '/network' },
    { label: 'QSI TV', path: '/tv' },
    { label: 'Healing', path: '/healing' },
  ];

  const userMenu = (
    <Menu theme="dark" className="glass-popover" style={{ minWidth: 160 }}>
      <Menu.Item key="1" icon={<DashboardOutlined />} onClick={() => navigate(user?.role === 'ENGINEER' ? '/engineer/dashboard' : '/dashboard')}>
        My Dashboard
      </Menu.Item>
      <Menu.Item key="2" icon={<HeartOutlined />} onClick={() => navigate('/healing')}>
        Healing Center
      </Menu.Item>
      <Menu.Divider style={{ background: 'rgba(255,255,255,0.05)' }} />
      <Menu.Item key="3" icon={<LogoutOutlined />} onClick={logout} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1001,
      height: 70,
      background: 'rgba(10, 25, 49, 0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '0 16px' : '0 24px'
    }}>
      <div style={{ width: '100%', maxWidth: 1400, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <RocketOutlined style={{ fontSize: 24, color: '#10b981' }} />
          <Text strong style={{ color: '#fff', fontSize: 18, letterSpacing: 1 }}>PANX</Text>
        </div>

        {!isMobile && (
          <nav style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Space size="large">
              {navItems.map(item => (
                <Button 
                  key={item.path}
                  type="text" 
                  style={{ color: location.pathname === item.path ? '#10b981' : '#fff' }} 
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </Space>
          </nav>
        )}

        <Space size="middle">
          {isAuthenticated ? (
            <>
              {!isMobile && <NotificationCenter />}
              <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  {!isMobile && <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{user?.name}</Text>}
                  <Avatar size={isMobile ? "small" : "default"} icon={<UserOutlined />} style={{ background: '#10b981' }} />
                </div>
              </Dropdown>
              {isMobile && (
                <Button 
                  type="text" 
                  icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />} 
                  onClick={() => setMobileVisible(true)} 
                />
              )}
            </>
          ) : (
            <>
               <Button type="primary" shape="round" onClick={() => navigate('/login')}>Sign In</Button>
               {isMobile && (
                <Button 
                  type="text" 
                  icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />} 
                  onClick={() => setMobileVisible(true)} 
                />
              )}
            </>
          )}
        </Space>
      </div>

      <Drawer
        title={<Text style={{ color: '#fff' }}>PANX Navigation</Text>}
        placement="right"
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        styles={{ 
          body: { background: '#0A1931', padding: 0 },
          header: { background: '#1A3D63', borderBottom: '1px solid rgba(255,255,255,0.1)' }
        }}
        width={250}
      >
        <Menu
          mode="vertical"
          theme="dark"
          selectedKeys={[location.pathname]}
          style={{ background: 'transparent', border: 'none' }}
          onClick={() => setMobileVisible(false)}
        >
          {navItems.map(item => (
            <Menu.Item key={item.path} onClick={() => navigate(item.path)}>
              {item.label}
            </Menu.Item>
          ))}
          <Menu.Divider />
          {isAuthenticated ? (
            <>
              <Menu.Item key="dash" icon={<DashboardOutlined />} onClick={() => navigate(user?.role === 'ENGINEER' ? '/engineer/dashboard' : '/dashboard')}>
                Dashboard
              </Menu.Item>
              <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout} danger>
                Logout
              </Menu.Item>
            </>
          ) : (
             <Menu.Item key="signin" onClick={() => navigate('/login')}>Sign In</Menu.Item>
          )}
        </Menu>
      </Drawer>
    </Header>
  );
};

export default GlobalNavbar;
