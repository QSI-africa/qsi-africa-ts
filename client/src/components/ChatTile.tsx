import React from 'react';
import { GeometricCard } from './AfroBauhausComponents';

interface ChatTileProps {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  onClick?: () => void;
  color?: string;
}

const ChatTile: React.FC<ChatTileProps> = ({ icon, name, tagline, onClick, color }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'var(--snappy)',
      }}
    >
      <GeometricCard 
        className="chat-tile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '24px',
          marginBottom: '16px',
          borderRadius: '0px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--canvas-white)',
        }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: color || 'var(--papyrus-off-white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: 'var(--onyx-black)',
          border: '2px solid var(--onyx-black)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '18px', 
            margin: 0, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            color: 'var(--onyx-black)'
          }}>
            {name}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            margin: '4px 0 0 0', 
            color: 'var(--ash-grey)',
            fontFamily: 'var(--font-accent)',
            fontWeight: 500
          }}>
            {tagline}
          </p>
        </div>

        {/* Small "Arrow" or indicator like a chat bubble */}
        <div style={{
          fontSize: '20px',
          opacity: 0.3,
          fontFamily: 'var(--font-accent)'
        }}>
          &gt;
        </div>
      </GeometricCard>

      <style>{`
        .chat-tile {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .chat-tile:hover {
          transform: translateX(8px);
          border-color: var(--baobab-emerald) !important;
        }
      `}</style>
    </div>
  );
};

export default ChatTile;
