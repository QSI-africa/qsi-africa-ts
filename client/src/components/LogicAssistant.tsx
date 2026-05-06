import React, { useState } from 'react';
import { Button, Tooltip, theme, Dropdown, Menu } from 'antd';
import { RobotOutlined, BuildOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { useToken } = theme;

const LogicAssistant: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        Healing & Therapy
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 120 : 40,
      right: 25,
      zIndex: 1000,
    }}>
      <style>
        {`
          @keyframes pulse-vibrant {
            0% { box-shadow: 0 0 0 0 rgba(209, 91, 53, 0.6); }
            70% { box-shadow: 0 0 0 20px rgba(209, 91, 53, 0); }
            100% { box-shadow: 0 0 0 0 rgba(209, 91, 53, 0); }
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
            size="large"
            icon={<RobotOutlined style={{ fontSize: '28px' }} />}
            className="assistant-vibrant-glow"
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--baobab-emerald)',
              borderColor: 'var(--onyx-black)',
              borderWidth: '3px',
              boxShadow: '6px 6px 0px var(--onyx-black)',
            }}
          />
        </Tooltip>
      </Dropdown>
    </div>
  );
};

export default LogicAssistant;
