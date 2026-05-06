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

  const servicesMenu = (
    <Menu className="header-menu" style={{ minWidth: '240px' }}>
      <Menu.Item key="infrastructure" icon={<DesktopOutlined />} onClick={() => navigate('/chat/infrastructure')}>Smart Infrastructure</Menu.Item>
      <Menu.Item key="vision" icon={<BulbOutlined />} onClick={() => navigate('/chat/vision')}>Vision Space</Menu.Item>
      <Menu.Item key="mobility" icon={<CarOutlined />} onClick={() => navigate('/mobility')}>PanX Mobility</Menu.Item>
      <Menu.Item key="healing" icon={<HeartOutlined />} onClick={() => navigate('/chat/healing')}>Healing and Wisdom</Menu.Item>
      <Menu.Item key="lab" icon={<ExperimentOutlined />} onClick={() => navigate('/lab')}>PanX Lab</Menu.Item>
      <Menu.Item key="inbox" icon={<MessageOutlined />} onClick={() => navigate('/inbox')}>Messaging Inbox</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="concepts" onClick={() => navigate('/concepts')}>Digital Concepts</Menu.Item>
      <Menu.Item key="demos" onClick={() => navigate('/demos')}>City Demonstrators</Menu.Item>
      <Menu.Item key="tv" icon={<PlaySquareOutlined />} onClick={() => navigate('/tv')}>PanX TV</Menu.Item>
      <Menu.Item key="music" icon={<CustomerServiceOutlined />} onClick={() => navigate('/music')}>PanX Music</Menu.Item>
    </Menu>
  );

  const impactMenu = (
    <Menu className="header-menu" style={{ minWidth: '200px' }}>
      <Menu.Item key="projects" onClick={() => navigate('/demos')}>Pilot Projects</Menu.Item>
      <Menu.Item key="community" onClick={() => navigate('/about-us')}>Community Impact</Menu.Item>
      <Menu.Item key="reports" onClick={() => navigate('/concepts')}>Sustainable Reports</Menu.Item>
    </Menu>
  );

  const insightsMenu = (
    <Menu className="header-menu" style={{ minWidth: '200px' }}>
      <Menu.Item key="news" onClick={() => navigate('/')}>Latest News</Menu.Item>
      <Menu.Item key="blog" onClick={() => navigate('/concepts')}>Research Blog</Menu.Item>
      <Menu.Item key="network" onClick={() => navigate('/network')}>Sovereign Minds</Menu.Item>
    </Menu>
  );

  const navItems = [
    { label: 'Services', path: '/services', dropdown: servicesMenu },
    { label: 'Impact', path: '#', dropdown: impactMenu },
    { label: 'Insights', path: '#', dropdown: insightsMenu },
    { label: 'About', path: '/about-us' },
  ];

  const userMenu = (
    <Menu className="geometric-card" style={{ padding: '8px', border: '2px solid var(--onyx-black)' }}>
      <Menu.Item key="1" icon={<DashboardOutlined />} onClick={() => navigate(user?.role === 'ENGINEER' ? '/engineer/dashboard' : '/dashboard')}>
        My Dashboard
      </Menu.Item>
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_USER') && (
        <Menu.Item key="admin" icon={<SettingOutlined />} onClick={() => navigate('/admin')}>
          Admin Command
        </Menu.Item>
      )}
      <Menu.Item key="2" icon={<HeartOutlined />} onClick={() => navigate('/healing')}>
        Healing and Wisdom
      </Menu.Item>
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
      background: 'var(--canvas-white)',
      borderBottom: '2px solid var(--onyx-black)',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '0 16px' : '0 5%'
    }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} 
          onClick={() => navigate('/')}
        >
          <div style={{ width: 32, height: 32, backgroundColor: 'var(--baobab-emerald)' }} />
          <Text strong style={{ 
            color: 'var(--onyx-black)', 
            fontSize: 24, 
            fontFamily: 'var(--font-heading)',
            letterSpacing: 1,
            textTransform: 'uppercase'
          }}>QSI Africa</Text>
        </div>

        {!isMobile && (
          <nav style={{ flex: 1, display: 'flex', justifyContent: 'center', height: '100%' }}>
            <Space size={0}>
              {navItems.map(item => (
                item.dropdown ? (
                  <Dropdown overlay={item.dropdown} key={item.label}>
                    <Button 
                      type="text" 
                      className={`nav-link-btn ${location.pathname.startsWith(item.path) && item.path !== '#' ? 'active' : ''}`}
                      style={{ 
                        color: 'var(--onyx-black)',
                        fontFamily: 'var(--font-accent)',
                        textTransform: 'uppercase',
                        fontSize: '12px',
                        letterSpacing: '0.1em',
                        padding: '0 24px'
                      }}
                    >
                      {item.label} <DownOutlined style={{ fontSize: '10px', marginLeft: '8px' }} />
                    </Button>
                  </Dropdown>
                ) : (
                  <Button 
                    key={item.label}
                    type="text" 
                    className={`nav-link-btn ${location.pathname === item.path ? 'active' : ''}`}
                    style={{ 
                      color: 'var(--onyx-black)',
                      fontFamily: 'var(--font-accent)',
                      textTransform: 'uppercase',
                      fontSize: '12px',
                      letterSpacing: '0.1em',
                      padding: '0 24px'
                    }} 
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
              className="afro-button" 
              style={{ padding: '0 24px', height: '40px', borderColor: 'var(--onyx-black)', color: 'var(--onyx-black)' }}
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
                    style={{ backgroundColor: 'var(--baobab-emerald)', borderRadius: 0 }} 
                  />
                </div>
              </Dropdown>
            </>
          ) : (
            <Button 
              className="afro-button primary" 
              style={{ padding: '0 24px', height: '40px' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
          
          {isMobile && (
            <Button 
              type="text" 
              icon={<MenuOutlined style={{ color: 'var(--onyx-black)', fontSize: 24 }} />} 
              onClick={() => setMobileVisible(true)} 
            />
          )}
        </Space>
      </div>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 24, height: 24, backgroundColor: 'var(--baobab-emerald)' }} />
            <Text strong style={{ 
              fontFamily: 'var(--font-heading)', 
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: 18
            }}>Navigation</Text>
          </div>
        }
        placement="right"
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        styles={{ 
          body: { background: 'var(--canvas-white)', padding: 0 },
          header: { borderBottom: '3px solid var(--onyx-black)', padding: '20px 24px' }
        }}
        width={windowWidth < 480 ? '100%' : 320}
        closeIcon={<MenuOutlined style={{ color: 'var(--onyx-black)', fontSize: 20 }} />}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ 
            border: 'none',
            background: 'transparent',
            padding: '16px 0'
          }}
          onClick={() => setMobileVisible(false)}
        >
          <Menu.Item key="home" onClick={() => navigate('/')} style={{ height: '50px', margin: '4px 16px', borderRadius: 0, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 700 }}>
            Home
          </Menu.Item>
          
          <Menu.SubMenu 
            key="services" 
            title="SERVICES" 
            style={{ fontFamily: 'var(--font-accent)', fontWeight: 700 }}
            className="mobile-submenu"
          >
            <Menu.Item key="infra" onClick={() => navigate('/chat/infrastructure')}>Smart Infrastructure</Menu.Item>
            <Menu.Item key="vision" onClick={() => navigate('/chat/vision')}>Vision Space</Menu.Item>
            <Menu.Item key="mobility" onClick={() => navigate('/mobility')}>PanX Mobility</Menu.Item>
            <Menu.Item key="healing-m" onClick={() => navigate('/chat/healing')}>Healing and Wisdom</Menu.Item>
            <Menu.Item key="lab" onClick={() => navigate('/lab')}>PanX Lab</Menu.Item>
            <Menu.Item key="inbox" onClick={() => navigate('/inbox')}>Messaging Inbox</Menu.Item>
            <Menu.Divider />
            <Menu.Item key="concepts" onClick={() => navigate('/concepts')}>Concepts</Menu.Item>
            <Menu.Item key="demos" onClick={() => navigate('/demos')}>Demos</Menu.Item>
            <Menu.Item key="tv" onClick={() => navigate('/tv')}>PanX TV</Menu.Item>
            <Menu.Item key="music" onClick={() => navigate('/music')}>PanX Music</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu 
            key="impact" 
            title="IMPACT" 
            style={{ fontFamily: 'var(--font-accent)', fontWeight: 700 }}
            className="mobile-submenu"
          >
            <Menu.Item key="projects" onClick={() => navigate('/demos')}>Pilot Projects</Menu.Item>
            <Menu.Item key="community" onClick={() => navigate('/about-us')}>Community Impact</Menu.Item>
            <Menu.Item key="reports" onClick={() => navigate('/concepts')}>Sustainable Reports</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu 
            key="insights" 
            title="INSIGHTS" 
            style={{ fontFamily: 'var(--font-accent)', fontWeight: 700 }}
            className="mobile-submenu"
          >
            <Menu.Item key="news" onClick={() => navigate('/')}>Latest News</Menu.Item>
            <Menu.Item key="blog" onClick={() => navigate('/concepts')}>Research Blog</Menu.Item>
            <Menu.Item key="network" onClick={() => navigate('/network')}>Sovereign Minds</Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="about" onClick={() => navigate('/about-us')} style={{ height: '50px', margin: '4px 16px', borderRadius: 0, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 700 }}>
            About
          </Menu.Item>
          <Menu.Item key="contact" onClick={() => navigate('/contact-us')} style={{ height: '50px', margin: '4px 16px', borderRadius: 0, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontWeight: 700 }}>
            Contact Us
          </Menu.Item>
          
          <Menu.Divider style={{ margin: '16px 0', borderTop: '2px solid var(--onyx-black)', opacity: 0.1 }} />
          
          {isAuthenticated ? (
            <>
              <Menu.Item key="dash" icon={<DashboardOutlined />} onClick={() => navigate(user?.role === 'ENGINEER' ? '/engineer/dashboard' : '/dashboard')} style={{ margin: '4px 16px' }}>
                Dashboard
              </Menu.Item>
              <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout} danger style={{ margin: '4px 16px' }}>
                Logout
              </Menu.Item>
            </>
          ) : (
             <Menu.Item key="signin" onClick={() => navigate('/login')} style={{ margin: '4px 16px', fontWeight: 700 }}>Sign In</Menu.Item>
          )}
        </Menu>
      </Drawer>
    </Header>
  );
};

export default GlobalNavbar;
