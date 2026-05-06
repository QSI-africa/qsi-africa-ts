import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  ExperimentOutlined, 
  UserOutlined 
} from '@ant-design/icons';

const BottomNavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: <HomeOutlined />, path: '/' },
    { label: 'Lab', icon: <ExperimentOutlined />, path: '/lab' },
    { label: 'Inbox', icon: <InboxPlaceholder />, path: '/inbox' },
    { label: 'Profiles', icon: <UserOutlined />, path: '/network' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '70px',
      backgroundColor: 'var(--canvas-white)',
      borderTop: '2px solid var(--onyx-black)',
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
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? 'var(--baobab-emerald)' : 'var(--onyx-black)',
              transition: 'var(--snappy)',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '20px' }}>{item.icon}</div>
            <span style={{ 
              fontSize: '10px', 
              fontFamily: 'var(--font-accent)', 
              textTransform: 'uppercase',
              fontWeight: isActive ? 800 : 500
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                width: '40px',
                height: '3px',
                backgroundColor: 'var(--baobab-emerald)'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Simple Inbox Icon Placeholder if MessageOutlined isn't enough
const InboxPlaceholder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export default BottomNavigationBar;
