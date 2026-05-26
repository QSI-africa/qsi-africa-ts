import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Brain, Sparkles, X } from 'lucide-react';
import qsiLogo from '../assets/images/qsi_light_logo.png';

const LogicAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide on inbox and authentication/onboarding pages to prevent overlap
  const hiddenRoutes = ['/inbox', '/login', '/register', '/onboarding'];
  if (hiddenRoutes.includes(location.pathname) || location.pathname.startsWith('/chat')) return null;

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: isMobile ? 100 : 40, // Offset upwards on mobile for navigation bar
        right: isMobile ? 20 : 40,
        zIndex: 1000,
      }}
    >
      <style>
        {`
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
            70% { box-shadow: 0 0 0 16px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          .pulse-ring {
            animation: pulse-ring 2.5s infinite;
          }
          .assistant-trigger-btn:hover {
            transform: scale(1.06) translateY(-2px);
            box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
          }
          .assistant-trigger-btn:active {
            transform: scale(0.95);
          }
          .logic-assistant-item:hover {
            background: rgba(16, 185, 129, 0.08) !important;
            border-color: rgba(16, 185, 129, 0.3) !important;
            transform: translateX(4px);
          }
          .logic-assistant-item:hover .item-icon-container {
            background: rgba(16, 185, 129, 0.15) !important;
            border-color: rgba(16, 185, 129, 0.4) !important;
            color: var(--accent-primary) !important;
          }
          .logic-assistant-item:hover .item-title {
            color: var(--accent-primary) !important;
          }
          .logic-assistant-item:hover .item-desc {
            color: rgba(255, 255, 255, 0.7) !important;
          }
        `}
      </style>

      {/* Glassmorphic Dropdown Menu */}
      <div 
        style={{
          position: 'absolute',
          bottom: isMobile ? '76px' : '84px',
          right: 0,
          width: isMobile ? '290px' : '340px',
          background: 'rgba(24, 36, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(16, 185, 129, 0.1)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '14px', marginBottom: '4px' }}>
          <img src={qsiLogo} alt="QSI" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, lineHeight: 1.2 }}>
              QSI Logic Assistant
            </h4>
            <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, marginTop: '2px', opacity: 0.8 }}>
              Ecosystem Synthesis
            </p>
          </div>
        </div>

        {/* Menu Items */}
        {[
          {
            key: 'infra',
            title: 'Smart Infrastructure',
            desc: 'Strategic AI interface for modeling and building.',
            path: '/chat/infrastructure',
            icon: <LayoutGrid size={16} />,
            color: 'var(--accent-primary)',
          },
          {
            key: 'vision',
            title: 'Vision Space',
            desc: 'Translate raw imagination into actionable blueprints.',
            path: '/chat/vision',
            icon: <Brain size={16} />,
            color: 'var(--success-green)',
          },
          {
            key: 'healing',
            title: 'Healing & Wisdom',
            desc: 'Personalized alignment trajectory scans.',
            path: '/chat/healing',
            icon: <Sparkles size={16} />,
            color: '#f43f5e', // Warm premium pink/rose color
          }
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
            style={{
              display: 'flex',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="logic-assistant-item"
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.color,
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            className="item-icon-container"
            >
              {item.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'white', margin: 0, transition: 'color 0.2s' }} className="item-title">
                {item.title}
              </h5>
              <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', margin: 0, lineHeight: 1.3, transition: 'color 0.2s' }} className="item-desc">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <Tooltip title="QSI Logic Assistant - Chat with our AI" placement="left" open={isOpen ? false : undefined}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: isMobile ? '56px' : '64px',
            height: isMobile ? '56px' : '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isOpen 
              ? '0 0 25px rgba(16, 185, 129, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)' 
              : '0 10px 30px -5px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            outline: 'none',
          }}
          className="assistant-trigger-btn"
        >
          {/* Animated pulse ring */}
          <div 
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              background: 'transparent',
              boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.5)',
              pointerEvents: 'none',
            }}
            className={isOpen ? '' : 'pulse-ring'}
          />
          
          {/* Cross-fade and rotate: QSI Logo image */}
          <div style={{
            position: 'absolute',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'rotate(90deg) scale(0.6)' : 'rotate(0) scale(1)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img 
              src={qsiLogo} 
              alt="QSI Logo" 
              style={{ 
                width: isMobile ? '30px' : '36px', 
                height: isMobile ? '30px' : '36px', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
              }} 
            />
          </div>

          {/* Cross-fade and rotate: Close icon */}
          <div style={{
            position: 'absolute',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(0.6)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <X size={isMobile ? 22 : 26} strokeWidth={2.5} />
          </div>
        </button>
      </Tooltip>
    </div>
  );
};

export default LogicAssistant;
