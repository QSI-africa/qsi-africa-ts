import React, { useState, useEffect } from 'react';
import { 
  Typography, Row, Col, Form, Input, 
  Tag, Tabs, Badge, Modal, notification, 
  Empty, Spin
} from 'antd';
import { 
  Truck, 
  MapPin, 
  Send, 
  ShieldCheck, 
  History, 
  Rocket, 
  CheckCircle, 
  User,
  Zap,
  Activity,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  Globe,
  Clock,
  DollarSign,
  Package
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { useNavigate, Link } from 'react-router-dom';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const GREEN = '#10B981';

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
  const [rideOffers, setRideOffers] = useState<any[]>([]);
  const [rideRequests, setRideRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchBroadcasts();
    fetchRides();
    if (isAuthenticated) {
      fetchMyVisits();
      if (user?.role === 'ENGINEER' || user?.role === 'ADMIN' || user?.role === 'SUPER_USER') {
        fetchIncomingVisits();
      }
    }

    socketService.on('new-vehicle-hire', (data) => {
      setBroadcasts(prev => [data, ...prev]);
      notification.info({
        message: 'New Logistics Opportunity',
        description: `${data.engineerName} needs transport at ${data.location}.`,
        icon: <Truck size={18} style={{ color: GREEN }} />,
      });
    });

    socketService.on('vehicle-hire-accepted', (data) => {
      notification.success({
        message: 'Request Accepted',
        description: `Your logistics request has been accepted by ${data.acceptedBy}.`,
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
  }, [isAuthenticated, user?.id, user?.role]);

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

  const fetchRides = async () => {
    try {
      const offersRes = await api.get('/mobility/rides?type=OFFER');
      setRideOffers(offersRes.data);
      const reqsRes = await api.get('/mobility/rides?type=REQUEST');
      setRideRequests(reqsRes.data);
    } catch (error) {
      console.error("Fetch rides error:", error);
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
        description: `Your request to visit ${selectedProject.title} has been synchronized.` 
      });
      setRequestModalVisible(false);
    } catch (error) {
      notification.error({ message: 'Synchronization Failed' });
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
        description: 'Your logistics request is now live in the ecosystem.',
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
        description: 'You have accepted this logistics mission.',
      });
      fetchBroadcasts();
    } catch (error) {
      notification.error({ message: 'Error accepting request' });
    }
  };

  const handlePostRide = async (values: any, type: string) => {
    setLoading(true);
    try {
      await api.post('/mobility/rides', { ...values, type });
      notification.success({ message: `Ride ${type.toLowerCase()} posted successfully.` });
      fetchRides();
    } catch (error) {
      notification.error({ message: `Failed to post ride ${type.toLowerCase()}.` });
    } finally {
      setLoading(false);
    }
  };

  const handleFleetRequest = async (values: any) => {
    if (!isAuthenticated) {
      notification.warning({ message: 'Please log in to request a fleet ride.' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/mobility/fleet-request', values);
      notification.success({ 
        message: 'Request Submitted',
        description: 'Your fleet request has been submitted and is pending admin approval.'
      });
      setActiveTab('1'); // Go back to default tab
    } catch (error) {
      notification.error({ message: 'Failed to submit fleet request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Header */}
      <UnifiedHeader
        title="Mobility"
        subTitle="Logistics & Infrastructure"
        icon={<Truck size={20} />}
        extra={null}
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Dynamic Content */}
          <Row justify="center">
            <Col xs={24} lg={12}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px', textTransform: 'none', letterSpacing: '0.05em' }}>Request a Fleet Ride</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Book a professional fleet driver for your mobility needs.</p>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <h4 style={{ color: 'white', margin: 0, fontSize: '12px' }}>Want to become a driver?</h4>
                    <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '11px' }}>Join our network of professional fleet drivers.</p>
                  </div>
                  <Link to="/register/fleet-driver" style={{ background: 'transparent', border: `1px solid ${GREEN}`, color: GREEN, padding: '8px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none' }}>
                    Apply Here
                  </Link>
                </div>
                <Form layout="vertical" onFinish={handleFleetRequest}>
                  <Form.Item name="pickupLocation" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Pickup Location</span>} rules={[{ required: true }]}>
                    <Input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px' }} placeholder="e.g. Airport" />
                  </Form.Item>
                  <Form.Item name="dropoffLocation" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Drop-off Location</span>} rules={[{ required: true }]}>
                    <Input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px' }} placeholder="e.g. Hotel" />
                  </Form.Item>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="rideDate" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Date</span>} rules={[{ required: true }]}>
                        <Input type="date" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px', colorScheme: 'dark' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="rideTime" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Time</span>} rules={[{ required: true }]}>
                        <Input type="time" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px', colorScheme: 'dark' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="offerPrice" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Offer Price (USD)</span>} rules={[{ required: true }]}>
                    <Input type="number" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px' }} placeholder="0.00" prefix={<DollarSign size={14} color={GREEN} />} />
                  </Form.Item>

                  <Form.Item name="details" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Additional Details</span>}>
                    <Input.TextArea rows={3} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white' }} placeholder="Any special requests or luggage info..." />
                  </Form.Item>

                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    background: GREEN, color: 'white', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 900, textTransform: 'none', letterSpacing: '0.15em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: `0 8px 20px -5px ${GREEN}60`
                  }}>
                    <Rocket size={16} /> Submit Fleet Request
                  </button>
                </Form>
              </div>
            </Col>
          </Row>
      </div>

      {/* Modal Redesign */}
      <Modal
        title={null}
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={null}
        width={480}
        centered
        className="dark-modal"
        styles={{ content: { background: '#0a1018', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: 0 } }}
      >
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${GREEN}15`, border: `1px solid ${GREEN}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
              <Package size={18} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>Site Synchronisation</h3>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'none', letterSpacing: '0.1em' }}>Target Site</span>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginTop: '4px', marginBottom: 0 }}>{selectedProject?.title}</h4>
          </div>

          <Form layout="vertical" onFinish={handleSubmitVisit}>
            <Form.Item 
              name="message" 
              label={<span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Operational Intent</span>}
              rules={[{ required: true, message: 'Please state your purpose' }]}
            >
              <Input.TextArea rows={4} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white' }} placeholder="Explain your operational interest in this site..." />
            </Form.Item>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button 
                type="submit"
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: GREEN, color: 'white', fontSize: '12px', fontWeight: 900, textTransform: 'none', letterSpacing: '0.1em', cursor: 'pointer' }}
              >
                Send Request
              </button>
              <button 
                onClick={() => setRequestModalVisible(false)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', fontSize: '12px', fontWeight: 900, textTransform: 'none', letterSpacing: '0.1em', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      </Modal>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MobilityPage;
