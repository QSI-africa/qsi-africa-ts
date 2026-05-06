import React from 'react';
import { Card, Typography, Tag, Avatar, Space } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ProfileCardProps {
  id: string;
  name: string;
  role: string;
  specialization: string;
  bio: string;
  skills: string[];
  avatarUrl?: string;
  isVerified?: boolean;
  onClick: (id: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  role,
  specialization,
  bio,
  skills,
  avatarUrl,
  isVerified,
  onClick
}) => {
  return (
    <Card 
      className="geometric-card" 
      bodyStyle={{ padding: 0 }}
      style={{ 
        border: '3px solid var(--onyx-black)', 
        borderRadius: 0, 
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--canvas-white)',
        transition: 'var(--snappy)'
      }}
      onClick={() => onClick(id)}
    >
      <div style={{ display: 'flex', gap: '24px', alignItems: 'start', padding: '32px' }}>
        <div style={{ position: 'relative' }}>
          <Avatar 
            size={100} 
            src={avatarUrl} 
            icon={<UserOutlined />} 
            style={{ 
              borderRadius: 0, 
              border: '3px solid var(--onyx-black)',
              background: 'var(--papyrus-off-white)'
            }}
          />
          {isVerified && (
            <div style={{ 
              position: 'absolute', 
              bottom: -10, 
              right: -10, 
              background: 'var(--baobab-emerald)', 
              color: 'white',
              padding: '6px',
              border: '2px solid var(--onyx-black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}>
              <SafetyCertificateOutlined style={{ fontSize: '16px' }} />
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '12px' }}>
            <Title level={4} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em', fontWeight: 900 }}>
              {name}
            </Title>
            <Text style={{ 
              color: 'var(--baobab-emerald)', 
              fontWeight: 800, 
              fontFamily: 'var(--font-accent)', 
              fontSize: '11px', 
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {specialization || role}
            </Text>
          </div>
          
          <Paragraph style={{ color: 'var(--onyx-black)', fontSize: '14px', opacity: 0.8, marginBottom: '20px' }} ellipsis={{ rows: 2 }}>
            {bio || "Contributing to the pan-African infrastructure and mental transformation."}
          </Paragraph>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="small" wrap>
              {skills.slice(0, 3).map((skill: string) => (
                <Tag 
                  key={skill} 
                  style={{ 
                    borderRadius: 0, 
                    border: '1px solid var(--onyx-black)', 
                    background: 'var(--papyrus-off-white)', 
                    color: 'var(--onyx-black)', 
                    fontFamily: 'var(--font-accent)', 
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {skill}
                </Tag>
              ))}
            </Space>
            <div style={{ color: 'var(--onyx-black)', fontSize: '20px', transition: 'var(--snappy)' }}>
              <ArrowRightOutlined />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Bottom Bar */}
      <div style={{ 
        height: '4px', 
        width: '100%', 
        background: isVerified ? 'var(--baobab-emerald)' : 'var(--terracotta-clay)' 
      }} />
    </Card>
  );
};

export default ProfileCard;
