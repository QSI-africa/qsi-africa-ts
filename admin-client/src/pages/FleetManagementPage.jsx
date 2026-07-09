import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, Card, Row, Col, 
  Statistic, Tag, Button, Modal, Form, 
  Input, Select, Space, notification, Divider 
} from 'antd';
import { 
  CarOutlined, CheckCircleOutlined, SyncOutlined, 
  UserOutlined, SearchOutlined 
} from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

const FleetManagementPage = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reqsRes, driversRes] = await Promise.all([
        api.get('/admin/fleet/stats'),
        api.get('/admin/fleet/requests'),
        api.get('/admin/fleet/drivers')
      ]);
      setStats(statsRes.data);
      setRequests(reqsRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      notification.error({ message: 'Failed to fetch fleet data' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (id) => {
    try {
      await api.patch(`/admin/fleet/requests/${id}/process`);
      notification.success({ message: 'Request moved to PROCESSING' });
      fetchData();
    } catch (error) {
      notification.error({ message: 'Error processing request' });
    }
  };

  const handleBroadcastRequest = async (id) => {
    try {
      await api.post(`/admin/fleet/requests/${id}/broadcast`);
      notification.success({ message: 'Request broadcasted to fleet' });
      fetchData();
    } catch (error) {
      notification.error({ message: 'Error broadcasting request' });
    }
  };

  const handleDirectAssign = (record) => {
    setSelectedRequest(record);
    form.setFieldsValue({ 
      newPrice: record.finalPrice || record.offerPrice,
      adminNotes: record.adminNotes
    });
    setIsModalVisible(true);
  };

  const onAssignSubmit = async (values) => {
    try {
      // 1. Update Price & Notes
      await api.patch(`/admin/fleet/requests/${selectedRequest.id}/update-price`, {
        newPrice: values.newPrice,
        adminNotes: values.adminNotes
      });
      // 2. Assign Driver if selected
      if (values.driverId) {
        await api.post(`/admin/fleet/requests/${selectedRequest.id}/assign`, {
          driverId: values.driverId
        });
        notification.success({ message: 'Driver assigned successfully' });
      } else {
        notification.success({ message: 'Price updated successfully' });
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      notification.error({ message: 'Error assigning driver/updating price' });
    }
  };

  const toggleDriverApproval = async (driverId, currentStatus) => {
    try {
      await api.patch(`/admin/fleet/drivers/${driverId}/approve`, {
        isApproved: !currentStatus
      });
      notification.success({ message: `Driver ${!currentStatus ? 'Approved' : 'Suspended'}` });
      fetchData();
    } catch (error) {
      notification.error({ message: 'Error updating driver status' });
    }
  };

  const statusColors = {
    PENDING: 'orange',
    PROCESSING: 'blue',
    BROADCASTING: 'purple',
    ASSIGNED: 'cyan',
    IN_PROGRESS: 'geekblue',
    COMPLETED: 'green',
    CANCELLED: 'red'
  };

  const reqColumns = [
    { title: 'Date/Time', key: 'datetime', render: (_, r) => `${new Date(r.rideDate).toLocaleDateString()} ${r.rideTime}` },
    { title: 'Client', dataIndex: ['client', 'name'], key: 'client' },
    { title: 'Route', key: 'route', render: (_, r) => `${r.pickupLocation} ➔ ${r.dropoffLocation}` },
    { title: 'Price', key: 'price', render: (_, r) => `$${r.finalPrice || r.offerPrice}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={statusColors[s]}>{s}</Tag> },
    { title: 'Assigned To', key: 'driver', render: (_, r) => r.assignedDriver?.name || '-' },
    { 
      title: 'Action', 
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <Button size="small" type="primary" onClick={() => handleProcessRequest(record.id)}>Process</Button>
          )}
          {['PENDING', 'PROCESSING'].includes(record.status) && (
            <>
              <Button size="small" onClick={() => handleBroadcastRequest(record.id)}>Broadcast</Button>
              <Button size="small" type="dashed" onClick={() => handleDirectAssign(record)}>Assign/Edit</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const driverColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Vehicle', key: 'vehicle', render: (_, r) => `${r.fleetVehicle?.make} ${r.fleetVehicle?.model} (${r.fleetVehicle?.licensePlate})` },
    { title: 'Joined', dataIndex: 'createdAt', key: 'joined', render: d => new Date(d).toLocaleDateString() },
    { title: 'Status', key: 'status', render: (_, r) => (
      <Tag color={r.fleetVehicle?.isApproved ? 'green' : 'red'}>
        {r.fleetVehicle?.isApproved ? 'Approved' : 'Pending/Suspended'}
      </Tag>
    )},
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => (
        <Button 
          size="small" 
          danger={r.fleetVehicle?.isApproved}
          type={r.fleetVehicle?.isApproved ? "default" : "primary"}
          onClick={() => toggleDriverApproval(r.id, r.fleetVehicle?.isApproved)}
        >
          {r.fleetVehicle?.isApproved ? 'Suspend' : 'Approve'}
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}><CarOutlined /> Fleet Management Hub</Title>
      
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic title="Total Drivers" value={stats.totalDrivers} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic title="Available Drivers" value={stats.availableDrivers} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic title="Pending Reqs" value={stats.pendingRequests} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Card size="small">
              <Statistic title="Active Rides" value={stats.inProgressRequests} prefix={<SyncOutlined spin />} valueStyle={{ color: '#1677ff' }} />
            </Card>
          </Col>
        </Row>
      )}

      <Card title="Recent Ride Requests" style={{ marginBottom: '24px' }}>
        <Table 
          columns={reqColumns} 
          dataSource={requests} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Card title="Driver Roster">
        <Table 
          columns={driverColumns} 
          dataSource={drivers} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={`Manage Request: ${selectedRequest?.client?.name}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onAssignSubmit}>
          <Form.Item name="newPrice" label="Final Price (USD)" rules={[{ required: true }]}>
            <Input type="number" prefix="$" />
          </Form.Item>
          
          <Form.Item name="driverId" label="Directly Assign Driver (Optional)">
            <Select placeholder="Select a driver" allowClear>
              {drivers.filter(d => d.fleetVehicle?.isApproved).map(d => (
                <Option key={d.id} value={d.id}>{d.name} - {d.fleetVehicle?.make} {d.fleetVehicle?.model}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="adminNotes" label="Admin Notes (Internal & Client)">
            <Input.TextArea rows={3} placeholder="Notes about price changes or special instructions..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>Update & Notify</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FleetManagementPage;
