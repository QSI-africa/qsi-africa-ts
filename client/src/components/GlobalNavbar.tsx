import React from 'react';
import { Layout, Typography, Space, Button, Avatar, Dropdown, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import { 
  UserOutlined, LogoutOutlined, DashboardOutlined,
  HeartOutlined, RocketOutlined 
} from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

const GlobalNavbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding') {
    return null;
  }

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
      padding: '0 24px'
    }}>
      <div style={{ width: '100%', maxWidth: 1400, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <RocketOutlined style={{ fontSize: 24, color: '#10b981' }} />
          <Text strong style={{ color: '#fff', fontSize: 18, letterSpacing: 1 }}>PANX</Text>
        </div>

        <nav style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
           <Space size="large">
             <Button type="text" style={{ color: location.pathname === '/mobility' ? '#10b981' : '#fff' }} onClick={() => navigate('/mobility')}>Mobility</Button>
             <Button type="text" style={{ color: location.pathname === '/network' ? '#10b981' : '#fff' }} onClick={() => navigate('/network')}>Network</Button>
             <Button type="text" style={{ color: location.pathname === '/tv' ? '#10b981' : '#fff' }} onClick={() => navigate('/tv')}>QSI TV</Button>
             <Button type="text" style={{ color: location.pathname === '/healing' ? '#10b981' : '#fff' }} onClick={() => navigate('/healing')}>Healing</Button>
           </Space>
        </nav>

        <Space size="middle">
          {isAuthenticated ? (
            <>
              <NotificationCenter />
              <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{user?.name}</Text>
                  <Avatar size="small" icon={<UserOutlined />} style={{ background: '#10b981' }} />
                </div>
              </Dropdown>
            </>
          ) : (
            <Button type="primary" shape="round" onClick={() => navigate('/login')}>Sign In</Button>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default GlobalNavbar;
