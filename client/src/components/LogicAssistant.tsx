import React from 'react';
import { Button, Tooltip, theme } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { useToken } = theme;

const LogicAssistant: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = () => {
    navigate('/healing');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 160 : 80,
      right: 25,
      zIndex: 1000,
    }}>
      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(74, 127, 167, 0.4);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(74, 127, 167, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(74, 127, 167, 0);
            }
          }
          .assistant-pulsating-glow {
            animation: pulse 2s infinite;
          }
        `}
      </style>
      <Tooltip title="QSI Logic Assistant - Healing & Therapy" placement="left">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<RobotOutlined style={{ fontSize: '24px' }} />}
          className="assistant-pulsating-glow"
          onClick={handleClick}
          style={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4A7FA7 0%, #0A1931 100%)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          }}
        />
      </Tooltip>
    </div>
  );
};

export default LogicAssistant;
