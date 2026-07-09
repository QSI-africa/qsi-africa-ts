import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Row, Col, Statistic, 
  Table, Tag, Button, notification, Divider, Empty, Spin 
} from 'antd';
import { 
  CarOutlined, DollarCircleOutlined, EnvironmentOutlined, 
  CheckCircleOutlined, StarOutlined
} from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const FleetDriverDashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    setLoading(true);
    try {
      const [vehicleRes, requestsRes, historyRes] = await Promise.all([
        api.get('/fleet/my-vehicle'),
        api.get('/fleet/my-requests'),
        api.get('/fleet/my-history')
      ]);
      setProfile({
        fleetVehicle: vehicleRes.data,
        assignedFleetRequests: [...requestsRes.data, ...historyRes.data]
      });
    } catch (error) {
      notification.error({ message: 'Failed to load driver profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await api.patch(`/fleet/requests/${requestId}/status`, { status });
      notification.success({ message: `Ride status updated to ${status}` });
      fetchDriverProfile();
    } catch (error) {
      notification.error({ message: 'Error updating ride status' });
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  if (!profile) {
    return <Empty description="Profile not found" style={{ marginTop: '50px' }} />;
  }

  const { fleetVehicle, assignedFleetRequests } = profile;
  const isApproved = fleetVehicle?.isApproved;

  const statusColors = {
    ASSIGNED: 'cyan',
    IN_PROGRESS: 'blue',
    COMPLETED: 'green'
  };

  const activeRides = assignedFleetRequests?.filter(r => ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)) || [];
  const completedRides = assignedFleetRequests?.filter(r => r.status === 'COMPLETED') || [];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}><CarOutlined /> Driver Portal</Title>
        <Tag color={isApproved ? 'green' : 'orange'} style={{ padding: '6px 12px', fontSize: '14px' }}>
          {isApproved ? 'ACCOUNT ACTIVE' : 'PENDING APPROVAL'}
        </Tag>
      </div>

      {!isApproved && (
        <Card style={{ background: '#fffbe6', borderColor: '#ffe58f', marginBottom: '24px' }}>
          <Text strong style={{ color: '#faad14' }}>
            Your account is currently under review by administrators. You will be able to receive and manage ride assignments once approved.
          </Text>
        </Card>
      )}

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic 
              title="Total Earnings" 
              value={completedRides.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0)} 
              prefix={<DollarCircleOutlined />} 
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic 
              title="Completed Rides" 
              value={completedRides.length} 
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic 
              title="Vehicle Profile" 
              value={`${fleetVehicle?.make || 'N/A'} ${fleetVehicle?.model || ''}`} 
              prefix={<CarOutlined />} 
              suffix={<span style={{ fontSize: '14px', marginLeft: '8px' }}>({fleetVehicle?.licensePlate || 'N/A'})</span>}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Active Assignments" style={{ height: '100%' }}>
            {activeRides.length > 0 ? (
              activeRides.map(ride => (
                <div key={ride.id} style={{ 
                  border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px', marginBottom: '16px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Text strong style={{ fontSize: '16px' }}>{new Date(ride.rideDate).toLocaleDateString()} at {ride.rideTime}</Text>
                    <Tag color={statusColors[ride.status]}>{ride.status}</Tag>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <Text><EnvironmentOutlined style={{ color: 'green' }}/> <strong>Pickup:</strong> {ride.pickupLocation}</Text>
                    <Text><EnvironmentOutlined style={{ color: 'red' }}/> <strong>Dropoff:</strong> {ride.dropoffLocation}</Text>
                    <Text><strong>Client:</strong> {ride.client?.name} ({ride.client?.phone})</Text>
                    <Text><strong>Price:</strong> ${ride.finalPrice}</Text>
                  </div>

                  {ride.adminNotes && (
                    <div style={{ background: '#fafafa', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                      <Text type="secondary"><strong>Admin Notes:</strong> {ride.adminNotes}</Text>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {ride.status === 'ASSIGNED' && (
                      <Button type="primary" block onClick={() => handleUpdateStatus(ride.id, 'IN_PROGRESS')}>
                        Start Ride
                      </Button>
                    )}
                    {ride.status === 'IN_PROGRESS' && (
                      <Button type="primary" block style={{ background: 'green' }} onClick={() => handleUpdateStatus(ride.id, 'COMPLETED')}>
                        Complete Ride
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Empty description="No active assignments" />
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent History" style={{ height: '100%' }}>
            <Table 
              dataSource={completedRides}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              columns={[
                { title: 'Date', render: (_, r) => new Date(r.rideDate).toLocaleDateString() },
                { title: 'Route', render: (_, r) => `${r.pickupLocation} to ${r.dropoffLocation}` },
                { title: 'Price', render: (_, r) => `$${r.finalPrice}` },
                { title: 'Status', dataIndex: 'status', render: s => <Tag color={statusColors[s]}>{s}</Tag> }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FleetDriverDashboardPage;
