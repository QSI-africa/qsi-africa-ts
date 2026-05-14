import React from 'react';
import { Badge, Typography, Avatar } from 'antd';
import { 
  RobotOutlined, 
  UserOutlined, 
  ThunderboltOutlined,
  ProjectOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  type: 'module' | 'operator' | 'system-assisted' | 'project';
  unreadCount: number;
  avatar?: string;
  status?: 'online' | 'offline' | 'active';
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  isActive, 
  onClick 
}) => {
  const getTypeIcon = () => {
    switch (conversation.type) {
      case 'module': return <RobotOutlined style={{ color: 'var(--success-green)' }} />;
      case 'operator': return <UserOutlined style={{ color: '#ff4d4f' }} />;
      case 'system-assisted': return <ThunderboltOutlined style={{ color: 'var(--accent-gold)' }} />;
      case 'project': return <ProjectOutlined style={{ color: 'var(--savanna-moss)' }} />;
      default: return <UserOutlined />;
    }
  };

  const getTypeColor = () => {
    switch (conversation.type) {
      case 'module': return 'var(--success-green)';
      case 'operator': return '#ff4d4f';
      case 'system-assisted': return 'var(--accent-gold)';
      case 'project': return 'var(--savanna-moss)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div 
      onClick={onClick}
      style={{
        padding: '16px 20px',
        cursor: 'pointer',
        backgroundColor: isActive ? 'var(--bg-primary)' : 'var(--canvas-white)',
        borderBottom: '2px solid var(--border-subtle)',
        borderLeft: isActive ? '8px solid var(--success-green)' : '8px solid transparent',
        transition: 'var(--snappy)',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern for Active State */}
      {isActive && (
        <div className="" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          opacity: 0.05, 
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <Badge dot={conversation.status === 'online'} color="var(--success-green)" offset={[-4, 32]}>
          <Avatar 
            shape="square" 
            size={48} 
            icon={getTypeIcon()}
            style={{ 
              backgroundColor: 'var(--canvas-white)', 
              border: `2px solid var(--border-subtle)`,
              color: 'var(--border-subtle)',
              boxShadow: isActive ? '4px 4px 0px var(--border-subtle)' : 'none'
            }}
            src={conversation.avatar}
          />
        </Badge>
      </div>

      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <Title 
            level={5} 
            style={{ 
              margin: 0, 
              color: 'var(--border-subtle)', 
              textTransform: 'uppercase', 
              fontSize: '14px',
              fontFamily: 'var(--font-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {conversation.title}
          </Title>
          <Text style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-primary)' }}>
            {conversation.timestamp}
          </Text>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text 
            style={{ 
              fontSize: '12px', 
              color: conversation.unreadCount > 0 ? 'var(--border-subtle)' : 'var(--text-tertiary)',
              fontWeight: conversation.unreadCount > 0 ? 800 : 400,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              marginRight: '8px'
            }}
          >
            {conversation.lastMessage}
          </Text>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '8px', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              padding: '2px 6px',
              border: `1px solid ${getTypeColor()}`,
              color: getTypeColor(),
              fontFamily: 'var(--font-primary)',
            }}>
              {conversation.type}
            </span>
            {conversation.unreadCount > 0 && (
              <Badge 
                count={conversation.unreadCount} 
                style={{ 
                  backgroundColor: '#ff4d4f', 
                  borderRadius: 0,
                  border: '1px solid var(--border-subtle)',
                  fontSize: '10px',
                  fontWeight: 900
                }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
