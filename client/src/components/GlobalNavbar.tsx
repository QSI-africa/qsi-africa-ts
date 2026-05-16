import React, { useState, useEffect } from 'react';
import { Layout, Typography, Space, Button, Avatar, Dropdown, Menu, Drawer } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import { 
  UserOutlined, LogoutOutlined, DashboardOutlined,
  HeartOutlined, MenuOutlined, DownOutlined, SettingOutlined,
  ExperimentOutlined, MessageOutlined, CustomerServiceOutlined,
  PlaySquareOutlined, DesktopOutlined, BulbOutlined, CarOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

const GlobalNavbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileVisible, setMobileVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = windowWidth <= 768;

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/onboarding') {
    return null;
  }

  const servicesMenu = (
    <Menu className="header-menu" style={{ minWidth: '260px' }}>
      <Menu.Item key="infrastructure" icon={<DesktopOutlined />} onClick={() => navigate('/chat/infrastructure')}>Smart Infrastructure</Menu.Item>
      <Menu.Item key="vision" icon={<BulbOutlined />} onClick={() => navigate('/chat/vision')}>Vision Space</Menu.Item>
      <Menu.Item key="mobility" icon={<CarOutlined />} onClick={() => navigate('/mobility')}>PanX Mobility</Menu.Item>
      <Menu.Item key="healing" icon={<HeartOutlined />} onClick={() => navigate('/chat/healing')}>Healing and Wisdom</Menu.Item>
      <Menu.Item key="lab" icon={<ExperimentOutlined />} onClick={() => navigate('/lab')}>PanX Lab</Menu.Item>
      <Menu.Item key="inbox" icon={<MessageOutlined />} onClick={() => navigate('/inbox')}>Messaging Inbox</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="concepts" onClick={() => navigate('/concepts')}>Digital Concepts</Menu.Item>
      <Menu.Item key="demos" onClick={() => navigate('/demos')}>City Demonstrators</Menu.Item>
    </Menu>
  );

  const impactMenu = (
    <Menu className="header-menu" style={{ minWidth: '200px' }}>
      <Menu.Item key="projects" onClick={() => navigate('/demos')}>Pilot Projects</Menu.Item>
      <Menu.Item key="community" onClick={() => navigate('/about-us')}>Community Impact</Menu.Item>
      <Menu.Item key="reports" onClick={() => navigate('/concepts')}>Sustainable Reports</Menu.Item>
    </Menu>
  );

  const navItems = [
    { label: 'Impact', path: '#', dropdown: impactMenu },
    { label: 'About', path: '/about-us' },
  ];

  const userMenu = (
    <Menu className="header-menu" style={{ minWidth: '220px' }}>
      <Menu.Item key="1" icon={<DashboardOutlined />} onClick={() => navigate(user?.role === 'ENGINEER' ? '/engineer/dashboard' : '/dashboard')}>
        My Dashboard
      </Menu.Item>
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_USER') && (
        <Menu.Item key="admin" icon={<SettingOutlined />} onClick={() => navigate('/admin')}>
          Admin Command
        </Menu.Item>
      )}
      <Menu.Divider />
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
      height: 80,
      background: scrolled ? 'rgba(250, 250, 250, 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(2, 44, 34, 0.05)' : 'none',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '0 24px' : '0 6%',
      transition: 'var(--transition-smooth)'
    }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} 
          onClick={() => navigate('/')}
        >
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--success-green) 100%)' }} />
          <Text strong style={{ 
            color: 'var(--text-primary)', 
            fontSize: 22, 
            fontFamily: 'var(--font-primary)',
            letterSpacing: -0.5,
            fontWeight: 800
          }}>QSI Africa</Text>
        </div>

        {!isMobile && (
          <nav style={{ flex: 1, display: 'flex', justifyContent: 'center', height: '100%' }}>
            <Space size={32}>
              {navItems.map(item => (
                item.dropdown ? (
                  <Dropdown overlay={item.dropdown} key={item.label} placement="bottomCenter">
                    <Button 
                      type="text" 
                      className={`nav-link-btn ${location.pathname.startsWith(item.path) && item.path !== '#' ? 'active' : ''}`}
                    >
                      {item.label} <DownOutlined style={{ fontSize: '10px', marginLeft: '6px', opacity: 0.5 }} />
                    </Button>
                  </Dropdown>
                ) : (
                  <Button 
                    key={item.label}
                    type="text" 
                    className={`nav-link-btn ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </Button>
                )
              ))}
            </Space>
          </nav>
        )}

        <Space size="large">
          {!isMobile && (
             <Button 
              className="qsi-button" 
              style={{ padding: '0 24px', height: '44px' }}
              onClick={() => navigate('/contact-us')}
            >
              Contact Us
            </Button>
          )}
          
          {isAuthenticated ? (
            <>
              {!isMobile && <NotificationCenter />}
              <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <Avatar 
                    size={isMobile ? "small" : "default"} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px' }} 
                  />
                </div>
              </Dropdown>
            </>
          ) : (
            <Button 
              primary 
              style={{ padding: '0 24px', height: '44px' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
          
          {isMobile && (
            <Button 
              type="text" 
              icon={<MenuOutlined style={{ color: 'var(--text-primary)', fontSize: 24 }} />} 
              onClick={() => setMobileVisible(true)} 
            />
          )}
        </Space>
      </div>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }} />
            <Text strong style={{ 
              fontFamily: 'var(--font-primary)', 
              fontSize: 18
            }}>Navigation</Text>
          </div>
        }
        placement="right"
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        styles={{ 
          body: { background: 'var(--bg-primary)', padding: '24px 0' },
          header: { borderBottom: '1px solid rgba(2, 44, 34, 0.05)', padding: '20px 24px' }
        }}
        width={windowWidth < 480 ? '100%' : 320}
        closeIcon={<MenuOutlined style={{ color: 'var(--text-primary)', fontSize: 20 }} />}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ 
            border: 'none',
            background: 'transparent'
          }}
          onClick={() => setMobileVisible(false)}
        >
          <Menu.Item key="home" onClick={() => navigate('/')}>Home</Menu.Item>
          

          <Menu.SubMenu key="impact" title="Impact">
            <Menu.Item key="projects" onClick={() => navigate('/demos')}>Pilot Projects</Menu.Item>
            <Menu.Item key="community" onClick={() => navigate('/about-us')}>Community Impact</Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="about" onClick={() => navigate('/about-us')}>About</Menu.Item>
          <Menu.Item key="contact" onClick={() => navigate('/contact-us')}>Contact Us</Menu.Item>
          
          <Menu.Divider style={{ margin: '16px 24px', borderColor: 'rgba(2, 44, 34, 0.05)' }} />
          
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
             <Menu.Item key="signin" onClick={() => navigate('/login')} style={{ fontWeight: 700 }}>Sign In</Menu.Item>
          )}
        </Menu>
      </Drawer>
    </Header>
  );
};

export default GlobalNavbar;
