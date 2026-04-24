import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Row, Col, Button, Form, Input, 
  Select, Table, Tag, Space, Modal, notification, 
  Empty, Badge, Tabs, Divider, Tooltip 
} from 'antd';
import { 
  CarOutlined, EnvironmentOutlined, SendOutlined, 
  SafetyCertificateOutlined, HistoryOutlined, 
  RocketOutlined, CheckCircleOutlined, InfoCircleOutlined,
  UserOutlined 
} from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MobilityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');
  const [projects, setProjects] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [mySiteVisits, setMySiteVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
    fetchBroadcasts();
    if (isAuthenticated) fetchMyVisits();

    socketService.on('new-vehicle-hire', (data) => {
      setBroadcasts(prev => [data, ...prev]);
      notification.info({
        message: 'New Vehicle Hire Opportunity',
        description: `${data.engineerName} needs a car at ${data.location}. Price: ${data.price}`,
        icon: <CarOutlined style={{ color: '#10b981' }} />,
      });
    });

    socketService.on('vehicle-hire-accepted', (data) => {
      notification.success({
        message: 'Vehicle Request Accepted',
        description: `Your request for a vehicle has been accepted by ${data.acceptedBy}.`,
      });
      fetchBroadcasts();
    });

    return () => {
      socketService.off('new-vehicle-hire');
      socketService.off('vehicle-hire-accepted');
    };
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/network/projects');
      setProjects(response.data);
    } catch (error) {
      console.error("Fetch projects error:", error);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const response = await api.get('/mobility/broadcasts');
      setBroadcasts(response.data);
    } catch (error) {
      console.error("Fetch broadcasts error:", error);
    }
  };

  const fetchMyVisits = async () => {
    // Note: No backend endpoint yet for my-visits, skipping for now
  };

  const handleRequestSiteVisit = (project: any) => {
    setSelectedProject(project);
    setRequestModalVisible(true);
  };

  const handleSubmitVisit = async (values: any) => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      await api.post('/mobility/site-visit', {
        ...values,
        projectId: selectedProject.id
      });
      notification.success({ 
        message: 'Request Sent', 
        description: `Your request to visit ${selectedProject.title} has been sent to the lead engineer.` 
      });
      setRequestModalVisible(false);
    } catch (error) {
      notification.error({ message: 'Request Failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleHireVehicle = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/mobility/vehicle-hire', values);
      notification.success({
        message: 'Broadcast Active',
        description: 'Your vehicle request is now live for all users.',
      });
    } catch (error) {
      notification.error({ message: 'Broadcast Failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptHire = async (id: string) => {
    try {
      await api.post(`/mobility/vehicle-hire/${id}/accept`);
      notification.success({
        message: 'Accepted',
        description: 'You have accepted this vehicle hire request.',
      });
      fetchBroadcasts();
    } catch (error) {
      notification.error({ message: 'Error accepting request' });
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ color: '#fff' }}>QSI Mobility</Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.6)' }}>
          Coherence in motion. Connecting users with visionary sites and engineers with reliable logistics.
        </Paragraph>
      </div>

      <Card className="glass-card" style={{ borderRadius: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          {/* USER TAB: SITE VISITS */}
          <TabPane tab={<span><EnvironmentOutlined /> Site Viewings</span>} key="1">
            <div style={{ padding: '20px 0' }}>
              <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>Explore Projects for Site Visits</Title>
              {projects.length > 0 ? (
                <Row gutter={[20, 20]}>
                  {projects.map(project => (
                    <Col xs={24} sm={12} key={project.id}>
                      <Card 
                        className="glass-card" 
                        hoverable 
                        bodyStyle={{ padding: 20 }}
                        cover={project.imageUrl && <img alt={project.title} src={project.imageUrl} style={{ height: 180, objectFit: 'cover' }} />}
                      >
                        <Title level={5} style={{ margin: 0, color: '#fff' }}>{project.title}</Title>
                        <Text style={{ color: '#10b981', display: 'block', marginBottom: 12 }}>
                          {project.engineerProfile.user.name} 
                          {project.engineerProfile.isVerified && <SafetyCertificateOutlined style={{ marginLeft: 4 }} />}
                        </Text>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {project.description}
                        </Paragraph>
                        <Button 
                          type="primary" 
                          block 
                          icon={<SendOutlined />} 
                          onClick={() => handleRequestSiteVisit(project)}
                        >
                          Request Site Visit
                        </Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description={<Text style={{ color: 'rgba(255,255,255,0.45)' }}>No active projects for viewing</Text>} />
              )}
            </div>
          </TabPane>

          {/* ENGINEER TAB: LOGISTICS */}
          {(user?.role === 'ENGINEER' || user?.role === 'ADMIN' || user?.role === 'SUPER_USER') && (
            <TabPane tab={<span><CarOutlined /> Vehicle Hire (Engineer)</span>} key="2">
                <Row gutter={[32, 32]} style={{ padding: '20px 0' }}>
                  <Col xs={24} md={10}>
                    <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>Request Logistics</Title>
                    <div style={{ marginBottom: 24 }}>
                      <Button 
                        icon={<UserOutlined />} 
                        onClick={() => navigate('/engineer/dashboard')}
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        Go to Professional Dashboard
                      </Button>
                    </div>
                    <Form layout="vertical" onFinish={handleHireVehicle}>
                      <Form.Item name="location" label={<Text style={{ color: '#fff' }}>Pickup Location</Text>} rules={[{ required: true }]}>
                        <Input placeholder="Enter location" />
                      </Form.Item>
                      <Form.Item name="duration" label={<Text style={{ color: '#fff' }}>Duration</Text>} rules={[{ required: true }]}>
                        <Input placeholder="e.g., 4 Hours, 1 Day" />
                      </Form.Item>
                      <Form.Item name="price" label={<Text style={{ color: '#fff' }}>Proposed Price ($)</Text>} rules={[{ required: true }]}>
                        <Input type="number" placeholder="Enter amount" prefix="$" />
                      </Form.Item>
                      <Form.Item name="details" label={<Text style={{ color: '#fff' }}>Task Details</Text>}>
                        <Input.TextArea rows={4} placeholder="What is the mission?" />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" size="large" loading={loading} block icon={<RocketOutlined />}>
                        Broadcast Request
                      </Button>
                    </Form>
                  </Col>
                  <Col xs={24} md={14}>
                    <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>My Active Requests</Title>
                    {/* List of my hire requests could go here */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: 40, borderRadius: 12, textAlign: 'center' }}>
                       <HistoryOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
                       <Text style={{ display: 'block', color: 'rgba(255,255,255,0.2)' }}>Your request history will appear here</Text>
                    </div>
                  </Col>
                </Row>
            </TabPane>
          )}

          {/* BROADCAST FEED: FOR DRIVERS/USERS */}
          <TabPane tab={<span><Badge count={broadcasts.length} offset={[10, 0]} size="small">Marketplace</Badge></span>} key="3">
            <div style={{ padding: '20px 0' }}>
              <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>Vehicle Opportunities</Title>
              {broadcasts.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {broadcasts.map(req => (
                    <Col xs={24} key={req.id}>
                      <Card className="glass-card" bodyStyle={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <Tag color="green" style={{ marginBottom: 12 }}>ACTIVE BROADCAST</Tag>
                            <Title level={5} style={{ margin: 0, color: '#fff' }}>{req.location}</Title>
                            <Text style={{ color: 'rgba(255,255,255,0.6)' }}><CarOutlined /> {req.duration} mission</Text>
                            <div style={{ marginTop: 12 }}>
                              <Text style={{ color: 'rgba(255,255,255,0.45)' }}>Engineer: {req.engineer.name}</Text>
                            </div>
                            {req.details && (
                              <Paragraph style={{ color: 'rgba(255,255,255,0.6)', marginTop: 10, background: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 8 }}>
                                {req.details}
                              </Paragraph>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Title level={3} style={{ margin: 0, color: '#10b981' }}>${req.price}</Title>
                            <Button 
                              type="primary" 
                              style={{ marginTop: 20, background: '#10b981', borderColor: '#10b981' }} 
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleAcceptHire(req.id)}
                            >
                              Accept Task
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={<Text style={{ color: 'rgba(255,255,255,0.45)' }}>No active hire requests in your area</Text>} 
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Site Visit Request Modal */}
      <Modal
        title={`Request Site Visit: ${selectedProject?.title}`}
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={null}
        className="glass-card"
      >
        <Form layout="vertical" onFinish={handleSubmitVisit}>
          <Paragraph style={{ color: 'rgba(0,0,0,0.6)' }}>
            Your details will be shared with <b>{selectedProject?.engineerProfile.user.name}</b>. 
            They will contact you to finalize the schedule.
          </Paragraph>
          <Form.Item 
            name="message" 
            label="Why do you want to visit this site?" 
            rules={[{ required: true, message: 'Please provide a short reason' }]}
          >
            <Input.TextArea rows={4} placeholder="Tell the engineer why you are interested in this project..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Send Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MobilityPage;
