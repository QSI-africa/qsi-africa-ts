import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  ExperimentOutlined, 
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons';

const BottomNavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: <HomeOutlined />, path: '/' },
    { label: 'Lab', icon: <ExperimentOutlined />, path: '/lab' },
    { label: 'PanX Chats', icon: <MessageOutlined />, path: '/inbox' },
    { label: 'Profiles', icon: <UserOutlined />, path: '/network' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      right: '16px',
      height: '72px',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: 'var(--shadow-premium)',
      border: '1px solid rgba(2, 44, 34, 0.05)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <div 
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              color: isActive ? 'var(--bg-secondary)' : 'var(--slate-grey)',
              flex: 1,
              position: 'relative'
            }}
          >
            <div style={{ 
              fontSize: '24px',
              transform: 'none'
            }}>{item.icon}</div>
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-green)'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BottomNavigationBar;
