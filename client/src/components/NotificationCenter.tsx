import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Button, Space, notification as antNotification } from 'antd';
import { BellOutlined, CheckCircleOutlined, CarOutlined, EnvironmentOutlined } from '@ant-design/icons';
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
    <div style={{ width: 350 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Title level={5} style={{ margin: 0, color: '#fff' }}>Notifications</Title>
        <Button type="link" size="small" onClick={markAllRead}>Mark all read</Button>
      </div>
      <List
        dataSource={notifications}
        style={{ maxHeight: 400, overflowY: 'auto' }}
        renderItem={item => (
          <List.Item className="premium-hover" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>
            <List.Item.Meta
              avatar={<div style={{ padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>{item.icon}</div>}
              title={<Text style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{item.title}</Text>}
              description={
                <Space direction="vertical" size={2}>
                  <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{item.description}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>{new Date(item.time).toLocaleTimeString()}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      {notifications.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.2)' }}>No recent activity</Text>
        </div>
      )}
      <div style={{ padding: 8, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
         <Button type="link" block>View all history</Button>
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
          icon={<BellOutlined style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)' }} />} 
          style={{ height: 40, width: 40 }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationCenter;
