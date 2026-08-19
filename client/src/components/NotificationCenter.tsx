import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Button, Space } from 'antd';
import { BellOutlined, CheckCircleOutlined, CarOutlined, EnvironmentOutlined, MessageOutlined } from '@ant-design/icons';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';

const { Text, Title } = Typography;

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen for real-time events
    socketService.on('new-vehicle-hire', (data) => {
      addNotification({
        id: Date.now(),
        type: 'VEHICLE_HIRE',
        title: 'New Logistics Opportunity',
        description: `Engineer ${data.engineerName} needs a vehicle at ${data.location}.`,
        time: new Date(),
        icon: <CarOutlined style={{ color: '#10b981' }} />
      });
    });

    socketService.on('vehicle-hire-accepted', (data) => {
      addNotification({
        id: Date.now(),
        type: 'HIRE_ACCEPTED',
        title: 'Vehicle Hire Accepted',
        description: `Your request has been accepted by ${data.acceptedBy}.`,
        time: new Date(),
        icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />
      });
    });

    // Direct Message notification
    socketService.on('direct_message_notification', (data) => {
      addNotification({
        id: Date.now(),
        type: 'DIRECT_MESSAGE',
        title: `Message from ${data.senderName}`,
        description: data.message?.text || 'Sent you a direct message.',
        time: new Date(),
        icon: <MessageOutlined style={{ color: '#008751' }} />
      });
    });

    // Site Visit events (Simulation for Sprint 4)
    socketService.on('site-visit-status', (data) => {
       addNotification({
         id: Date.now(),
         type: 'VISIT_STATUS',
         title: `Site Visit ${data.status}`,
         description: `Your request to visit ${data.projectTitle} was ${data.status.toLowerCase()}.`,
         time: new Date(),
         icon: <EnvironmentOutlined style={{ color: data.status === 'APPROVED' ? '#10b981' : '#ff4d4f' }} />
       });
    });

    return () => {
      socketService.off('new-vehicle-hire');
      socketService.off('vehicle-hire-accepted');
      socketService.off('direct_message_notification');
      socketService.off('site-visit-status');
    };
  }, []);

  const addNotification = (notif: any) => {
    setNotifications(prev => [notif, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);
  };

  const markAllRead = () => {
    setUnreadCount(0);
  };

  const notificationList = (
    <div style={{ width: 380, background: 'var(--canvas-white)', border: '4px solid var(--border-subtle)', boxShadow: '10px 10px 0px var(--border-subtle)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '2px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
        <Title level={5} style={{ margin: 0, color: 'var(--border-subtle)', textTransform: 'uppercase', fontFamily: 'var(--font-primary)', fontWeight: 900 }}>Notifications</Title>
        <Button type="link" size="small" onClick={markAllRead} style={{ color: 'var(--success-green)', fontWeight: 700, padding: 0 }}>MARK ALL READ</Button>
      </div>
      <List
        dataSource={notifications}
        style={{ maxHeight: 400, overflowY: 'auto' }}
        renderItem={item => (
          <List.Item className="notification-item" style={{ padding: '20px 24px', borderBottom: '1px solid var(--bg-primary)', cursor: 'pointer' }}>
            <List.Item.Meta
              avatar={<div style={{ padding: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>}
              title={<Text style={{ color: 'var(--border-subtle)', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', fontFamily: 'var(--font-primary)' }}>{item.title}</Text>}
              description={
                <Space direction="vertical" size={2}>
                  <Text style={{ color: 'var(--text-tertiary)', fontSize: 12, lineHeight: 1.4 }}>{item.description}</Text>
                  <Text style={{ color: 'rgba(0,0,0,0.2)', fontSize: 10, fontFamily: 'var(--font-primary)' }}>{new Date(item.time).toLocaleTimeString()}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      {notifications.length === 0 && (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--canvas-white)' }}>
          <Text style={{ color: 'var(--text-tertiary)', opacity: 0.3, textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>No recent activity</Text>
        </div>
      )}
      <div style={{ padding: '12px', textAlign: 'center', borderTop: '2px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
         <Button type="link" block style={{ color: 'var(--border-subtle)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' }}>View all history</Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={notificationList}
      trigger="click"
      placement="bottomRight"
      overlayClassName="glass-popover"
      onOpenChange={(visible) => visible && markAllRead()}
    >
      <Badge count={unreadCount} overflowCount={9} offset={[-2, 10]}>
        <Button 
          type="text" 
          icon={<BellOutlined style={{ fontSize: 22, color: 'var(--border-subtle)' }} />} 
          style={{ height: 44, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationCenter;
