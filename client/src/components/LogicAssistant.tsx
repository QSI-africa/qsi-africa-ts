import React, { useState } from 'react';
import { Button, Tooltip, theme, Dropdown, Menu } from 'antd';
import { RobotOutlined, BuildOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { useToken } = theme;

const QsiLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stylized Axe Head */}
    <path d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M20 10V30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M20 20H30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
  </svg>
);

const LogicAssistant: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't show on Inbox page as it overlaps with messaging controls
  // Moved after hooks to prevent "Rendered fewer hooks than expected" error
  if (location.pathname === '/inbox') return null;

  const menu = (
    <Menu 
      className="header-menu"
      style={{ 
        minWidth: '240px', 
        marginBottom: '12px',
        backgroundColor: 'var(--canvas-white)',
        border: '3px solid var(--onyx-black)',
        boxShadow: '10px 10px 0px var(--onyx-black)',
        padding: '8px'
      }}
    >
      <Menu.Item 
        key="infra" 
        icon={<BuildOutlined style={{ color: 'var(--savanna-moss)' }} />} 
        onClick={() => navigate('/chat/infrastructure')}
        style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Smart Infrastructure
      </Menu.Item>
      <Menu.Item 
        key="vision" 
        icon={<EyeOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
        onClick={() => navigate('/chat/vision')}
        style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Vision Space
      </Menu.Item>
      <Menu.Item 
        key="healing" 
        icon={<HeartOutlined style={{ color: 'var(--terracotta-clay)' }} />} 
        onClick={() => navigate('/chat/healing')}
        style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Healing and Wisdom
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 90 : 40, // Adjusted for bottom nav
      right: 25,
      zIndex: 1000,
    }}>
      <style>
        {`
          @keyframes pulse-vibrant {
            0% { box-shadow: 0 0 0 0 rgba(11, 97, 56, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(11, 97, 56, 0); }
            100% { box-shadow: 0 0 0 0 rgba(11, 97, 56, 0); }
          }
          .assistant-vibrant-glow {
            animation: pulse-vibrant 2s infinite;
          }
        `}
      </style>
      <Dropdown overlay={menu} placement="topRight" trigger={['click']}>
        <Tooltip title="QSI Logic Assistant - Chat with our AI" placement="left">
          <Button
            type="primary"
            shape="circle"
            icon={<QsiLogo />}
            className="assistant-vibrant-glow"
            style={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--baobab-emerald)',
              borderColor: 'var(--onyx-black)',
              borderWidth: '3px',
              boxShadow: '8px 8px 0px var(--onyx-black)',
              transition: 'var(--snappy)',
            }}
          />
        </Tooltip>
      </Dropdown>
    </div>
  );
};

export default LogicAssistant;
