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

const MobilityPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');
  const [projects, setProjects] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [myVisits, setMyVisits] = useState<any[]>([]);
  const [incomingVisits, setIncomingVisits] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchBroadcasts();
    if (isAuthenticated) {
      fetchMyVisits();
      if (user?.role === 'ENGINEER' || user?.role === 'ADMIN' || user?.role === 'SUPER_USER') {
        fetchIncomingVisits();
      }
    }

    socketService.on('new-vehicle-hire', (data) => {
      setBroadcasts(prev => [data, ...prev]);
      notification.info({
        message: 'New Vehicle Hire Opportunity',
        description: `${data.engineerName} needs a car at ${data.location}. Price: ${data.price}`,
        icon: <CarOutlined style={{ color: 'var(--baobab-emerald)' }} />,
      });
    });

    socketService.on('vehicle-hire-accepted', (data) => {
      notification.success({
        message: 'Vehicle Request Accepted',
        description: `Your request for a vehicle has been accepted by ${data.acceptedBy}.`,
      });
      fetchBroadcasts();
    });

    socketService.on('site-visit-status', (data) => {
      if (data.userId === user?.id) {
        notification.info({
          message: 'Site Visit Update',
          description: `Your request for ${data.projectTitle} has been ${data.status.toLowerCase()}.`,
        });
        fetchMyVisits();
      }
    });

    return () => {
      socketService.off('new-vehicle-hire');
      socketService.off('vehicle-hire-accepted');
      socketService.off('site-visit-status');
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
        description: `Your request to visit ${selectedProject.title} has been sent.` 
      });
      setRequestModalVisible(false);
    } catch (error) {
      notification.error({ message: 'Request Failed' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVisits = async () => {
    try {
      const response = await api.get('/mobility/my-visits');
      setMyVisits(response.data);
    } catch (error) {
      console.error("Fetch my visits error:", error);
    }
  };

  const fetchIncomingVisits = async () => {
    try {
      const response = await api.get('/mobility/my-project-visits');
      setIncomingVisits(response.data);
    } catch (error) {
      console.error("Fetch incoming visits error:", error);
    }
  };

  const handleUpdateVisitStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/mobility/site-visit/${id}/status`, { status });
      notification.success({ message: 'Status Updated', description: `Visit has been ${status.toLowerCase()}.` });
      fetchIncomingVisits();
    } catch (error) {
      notification.error({ message: 'Update Failed' });
    }
  };

  const handleHireVehicle = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/mobility/vehicle-hire', values);
      notification.success({
        message: 'Broadcast Active',
        description: 'Your vehicle request is now live.',
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
    <div style={{ background: "var(--canvas-white)", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div 
        className="pattern-dots"
        style={{
          padding: "120px 5% 60px 5%",
          borderBottom: "2px solid var(--onyx-black)",
          position: "relative"
        }}
      >
        <div className="container" style={{ padding: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="eyebrow reveal-up">Logistics & Infrastructure</span>
          <Title
            level={1}
            className="reveal-up"
            style={{ 
              fontSize: "clamp(48px, 8vw, 100px)", 
              margin: "0 0 24px 0",
              color: "var(--onyx-black)",
              textTransform: 'uppercase'
            }}
          >
            PanX <br /> Mobility
          </Title>
          <div className="grid-border-t grid-border-emerald" style={{ paddingTop: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <Paragraph
              className="reveal-up"
              style={{
                fontSize: "18px",
                color: "var(--onyx-black)",
                maxWidth: "600px",
                fontFamily: "var(--font-body)",
                fontWeight: 500
              }}
            >
              Coherence in motion. Connecting visionary sites with reliable logistics and sustainable transport solutions.
            </Paragraph>
          </div>
        </div>
      </div>

      <div className="container section-py">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          centered 
          className="afro-tabs"
          items={[
            {
              key: '1',
              label: <span>SITE VIEWINGS</span>,
              children: (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <Row gutter={[32, 32]} justify="center">
                    {projects.length > 0 ? (
                      projects.map(project => (
                        <Col xs={24} md={12} key={project.id}>
                          <Card 
                            className="geometric-card reveal-up" 
                            hoverable 
                            bodyStyle={{ padding: 0 }}
                            style={{ border: '2px solid var(--onyx-black)', borderRadius: 0, overflow: 'hidden' }}
                          >
                            <div style={{ height: '240px', borderBottom: '2px solid var(--onyx-black)' }}>
                              <img alt={project.title} src={project.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '32px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <Title level={4} style={{ margin: 0, textTransform: 'uppercase' }}>{project.title}</Title>
                                <Tag style={{ borderRadius: 0, border: '1px solid var(--onyx-black)', background: 'var(--baobab-emerald)', color: 'white' }}>ACTIVE</Tag>
                              </div>
                              <Text style={{ color: 'var(--baobab-emerald)', fontWeight: 800, display: 'block', marginBottom: 16, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', fontSize: '12px' }}>
                                {project.engineerProfile.user.name} 
                                {project.engineerProfile.isVerified && <SafetyCertificateOutlined style={{ marginLeft: 8 }} />}
                              </Text>
                              <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'var(--onyx-black)', opacity: 0.8, fontSize: '15px' }}>
                                {project.description}
                              </Paragraph>
                              <Button 
                                className="afro-button primary" 
                                block 
                                style={{ marginTop: '24px' }}
                                icon={<SendOutlined />} 
                                onClick={() => handleRequestSiteVisit(project)}
                              >
                                REQUEST SITE VISIT
                              </Button>
                            </div>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Empty description={<Text className="eyebrow">No active projects</Text>} />
                    )}
                  </Row>
                </div>
              )
            },
            ...((user?.role === 'ENGINEER' || user?.role === 'ADMIN' || user?.role === 'SUPER_USER') ? [{
              key: '2',
              label: <span>LOGISTICS (ENGINEER)</span>,
              children: (
                <Row gutter={[64, 64]} style={{ padding: '48px 0' }}>
                  <Col xs={24} md={10}>
                    <span className="eyebrow">Deployment</span>
                    <Title level={3} style={{ marginBottom: 32, textTransform: 'uppercase' }}>Request Logistics</Title>
                    
                    <Form layout="vertical" onFinish={handleHireVehicle} className="afro-form">
                      <Form.Item name="location" label={<span className="eyebrow">Pickup Location</span>} rules={[{ required: true }]}>
                        <Input className="afro-input" placeholder="e.g. Harare North" />
                      </Form.Item>
                      <Form.Item name="duration" label={<span className="eyebrow">Duration</span>} rules={[{ required: true }]}>
                        <Input className="afro-input" placeholder="e.g. 4 Hours" />
                      </Form.Item>
                      <Form.Item name="price" label={<span className="eyebrow">Proposed Price (USD)</span>} rules={[{ required: true }]}>
                        <Input type="number" className="afro-input" placeholder="0.00" prefix="$" />
                      </Form.Item>
                      <Form.Item name="details" label={<span className="eyebrow">Mission Details</span>}>
                        <Input.TextArea rows={4} className="afro-input" placeholder="Describe the task..." />
                      </Form.Item>
                      <Button className="afro-button primary" htmlType="submit" size="large" loading={loading} block icon={<RocketOutlined />}>
                        BROADCAST REQUEST
                      </Button>
                    </Form>
                  </Col>
                  <Col xs={24} md={14}>
                    <span className="eyebrow">Pending Inbound Visits</span>
                    <Title level={3} style={{ marginBottom: 32, textTransform: 'uppercase' }}>Review Requests</Title>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {incomingVisits.length > 0 ? (
                        incomingVisits.map(visit => (
                          <Card 
                            key={visit.id} 
                            size="small" 
                            style={{ border: '2px solid var(--onyx-black)', borderRadius: 0 }}
                            extra={<Tag color={visit.status === 'APPROVED' ? 'green' : visit.status === 'REJECTED' ? 'red' : 'gold'}>{visit.status}</Tag>}
                            title={<Text strong>{visit.user.name}</Text>}
                          >
                            <Paragraph style={{ fontSize: '13px', marginBottom: '16px' }}>{visit.message}</Paragraph>
                            <Space>
                              <Button size="small" type="primary" className="afro-button primary" onClick={() => handleUpdateVisitStatus(visit.id, 'APPROVED')}>APPROVE</Button>
                              <Button size="small" danger onClick={() => handleUpdateVisitStatus(visit.id, 'REJECTED')}>REJECT</Button>
                            </Space>
                          </Card>
                        ))
                      ) : (
                        <div 
                          className="pattern-lines" 
                          style={{ 
                            background: 'var(--papyrus-off-white)', 
                            padding: '64px', 
                            border: '2px solid var(--onyx-black)',
                            textAlign: 'center' 
                          }}
                        >
                           <HistoryOutlined style={{ fontSize: 40, color: 'var(--onyx-black)', opacity: 0.1, marginBottom: 16 }} />
                           <Text className="eyebrow" style={{ display: 'block', opacity: 0.4 }}>No incoming visit requests</Text>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              )
            }] : []),
            {
              key: '3',
              label: <span>MARKETPLACE <Badge count={broadcasts.length} offset={[10, -5]} /></span>,
              children: (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <Row gutter={[32, 32]} justify="center">
                    {broadcasts.length > 0 ? (
                      broadcasts.map(req => (
                        <Col xs={24} key={req.id}>
                          <Card className="geometric-card" bodyStyle={{ padding: '32px' }} style={{ border: '2px solid var(--onyx-black)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <Tag style={{ borderRadius: 0, border: '1px solid var(--onyx-black)', background: 'var(--baobab-emerald)', color: 'white', marginBottom: '16px' }}>ACTIVE OPPORTUNITY</Tag>
                                <Title level={3} style={{ margin: '0 0 8px 0', textTransform: 'uppercase' }}>{req.location}</Title>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                  <Text style={{ fontFamily: 'var(--font-accent)', fontSize: '12px' }}><CarOutlined /> {req.duration} MISSION</Text>
                                  <Text style={{ fontFamily: 'var(--font-accent)', fontSize: '12px' }}><UserOutlined /> ENG: {req.engineer.name}</Text>
                                </div>
                                {req.details && (
                                  <Paragraph style={{ color: 'var(--onyx-black)', opacity: 0.8, fontSize: '14px', background: 'var(--papyrus-off-white)', padding: '16px', border: '1px solid var(--onyx-black)' }}>
                                    {req.details}
                                  </Paragraph>
                                )}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <Title level={2} style={{ margin: '0 0 24px 0', color: 'var(--baobab-emerald)' }}>${req.price}</Title>
                                <Button 
                                  className="afro-button primary"
                                  icon={<CheckCircleOutlined />}
                                  onClick={() => handleAcceptHire(req.id)}
                                >
                                  ACCEPT TASK
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Empty description={<Text className="eyebrow">No active requests</Text>} />
                    )}
                  </Row>
                </div>
              )
            },
            {
              key: '4',
              label: <span>MY MOBILITY</span>,
              children: (
                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                  <span className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Personal Requests</span>
                  <Title level={3} style={{ marginBottom: 48, textTransform: 'uppercase' }}>Visit History</Title>
                  <Row gutter={[24, 24]} justify="center">
                    {myVisits.length > 0 ? (
                      myVisits.map(visit => (
                        <Col xs={24} md={12} key={visit.id}>
                          <Card 
                            style={{ border: '2px solid var(--onyx-black)', borderRadius: 0 }}
                            title={<Text strong>{visit.project.title}</Text>}
                            extra={<Tag color={visit.status === 'APPROVED' ? 'green' : visit.status === 'REJECTED' ? 'red' : 'gold'}>{visit.status}</Tag>}
                          >
                            <Text style={{ fontSize: '12px', color: 'var(--ash-grey)', textTransform: 'uppercase' }}>
                              Lead Engineer: {visit.project.engineerProfile.user.name}
                            </Text>
                            <Divider style={{ margin: '12px 0' }} />
                            <Paragraph style={{ fontSize: '14px' }}>{visit.message}</Paragraph>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Col span={24}>
                        <Empty description="No site visits requested yet" />
                      </Col>
                    )}
                  </Row>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Modal Refinement */}
      <Modal
        title={null}
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={null}
        width={500}
        centered
        className="bauhaus-modal"
      >
        <div style={{ padding: '40px', border: '2px solid var(--onyx-black)' }}>
          <span className="eyebrow">Site Visit Request</span>
          <Title level={3} style={{ margin: '8px 0 24px 0', textTransform: 'uppercase' }}>{selectedProject?.title}</Title>
          <Paragraph style={{ marginBottom: '32px', fontSize: '15px' }}>
            Requesting access to visit this site. The lead engineer will contact you via email or phone.
          </Paragraph>
          <Form layout="vertical" onFinish={handleSubmitVisit}>
            <Form.Item 
              name="message" 
              label={<span className="eyebrow">Interest & Purpose</span>} 
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} className="afro-input" placeholder="Explain your interest..." />
            </Form.Item>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button className="afro-button primary" htmlType="submit" block loading={loading}>
                SEND REQUEST
              </Button>
              <Button className="afro-button" onClick={() => setRequestModalVisible(false)} block>
                CANCEL
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .afro-tabs .ant-tabs-nav-list {
          width: 100%;
          justify-content: center;
        }
        .afro-tabs .ant-tabs-tab {
          font-family: var(--font-accent) !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          padding: 16px 32px !important;
          margin: 0 !important;
        }
        .afro-tabs .ant-tabs-tab-active {
          color: var(--baobab-emerald) !important;
        }
        .afro-tabs .ant-tabs-ink-bar {
          background: var(--baobab-emerald) !important;
          height: 4px !important;
        }
        .afro-input {
          border: 2px solid var(--onyx-black) !important;
          border-radius: 0 !important;
          padding: 12px 16px !important;
        }
        .bauhaus-modal .ant-modal-content {
          border-radius: 0 !important;
          padding: 0 !important;
        }
      `}} />
    </div>
  );
};

export default MobilityPage;
