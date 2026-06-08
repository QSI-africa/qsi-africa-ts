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
import { useNavigate } from 'react-router-dom';
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

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Header */}
      <UnifiedHeader
        title="Mobility"
        subTitle="Logistics & Infrastructure"
        icon={<Truck size={20} />}
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
             {['Site Viewings', 'Marketplace'].map((label, idx) => (
               <button 
                 key={label}
                 onClick={() => setActiveTab((idx + 1).toString())}
                 style={{
                   padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                   fontSize: '11px', fontWeight: 800, textTransform: 'none', letterSpacing: '0.1em',
                   transition: 'all 0.2s',
                   background: activeTab === (idx + 1).toString() ? GREEN : 'rgba(255,255,255,0.04)',
                   color: activeTab === (idx + 1).toString() ? 'white' : 'rgba(255,255,255,0.4)',
                   boxShadow: activeTab === (idx + 1).toString() ? `0 6px 16px -4px ${GREEN}60` : 'none',
                 }}
               >
                 {label}
               </button>
             ))}
          </div>
        }
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Dynamic Content */}
        {activeTab === '1' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {projects.length > 0 ? projects.map(project => (
              <div 
                key={project.id}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${GREEN}40`;
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ height: '200px', position: 'relative', background: '#0d1520' }}>
                  <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <span style={{ 
                      background: 'rgba(16,185,129,0.2)', border: `1px solid ${GREEN}40`, color: GREEN,
                      fontSize: '9px', fontWeight: 900, textTransform: 'none', padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.1em'
                    }}>Active Site</span>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>{project.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <User size={14} color={GREEN} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'none', letterSpacing: '0.05em' }}>
                      {project.engineerProfile?.user?.name || 'Lead Architect'}
                    </span>
                    {project.engineerProfile?.isVerified && <ShieldCheck size={12} color={GREEN} />}
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '24px', height: '42px', overflow: 'hidden' }}>
                    {project.description}
                  </p>
                  <button 
                    onClick={() => handleRequestSiteVisit(project)}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${GREEN}30`,
                      background: `${GREEN}10`, color: GREEN, cursor: 'pointer',
                      fontSize: '11px', fontWeight: 800, textTransform: 'none', letterSpacing: '0.1em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      transition: 'all 0.2s'
                    }}
                  >
                    Request Site Visit <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', padding: '80px 0', textAlign: 'center' }}>
                <Empty description={<span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '11px', textTransform: 'none', letterSpacing: '0.2em' }}>No active projects</span>} />
              </div>
            )}
          </div>
        )}

        {activeTab === '2' && (
          <Row gutter={[40, 40]}>
            <Col xs={24} lg={10}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '24px', textTransform: 'none', letterSpacing: '0.05em' }}>Deployment Brief</h3>
                <Form layout="vertical" onFinish={handleHireVehicle}>
                  <Form.Item name="location" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Pickup Location</span>}>
                    <Input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px' }} placeholder="e.g. Harare North" />
                  </Form.Item>
                  <Form.Item name="duration" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Duration</span>}>
                    <Input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px' }} placeholder="e.g. 4 Hours" />
                  </Form.Item>
                  <Form.Item name="price" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Proposed Bounty (USD)</span>}>
                    <Input type="number" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', height: '44px' }} placeholder="0.00" prefix={<DollarSign size={14} color={GREEN} />} />
                  </Form.Item>
                  <Form.Item name="details" label={<span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em' }}>Mission Details</span>}>
                    <Input.TextArea rows={4} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white' }} placeholder="Describe the mission scope..." />
                  </Form.Item>
                  <button style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    background: GREEN, color: 'white', cursor: 'pointer',
                    fontSize: '11px', fontWeight: 900, textTransform: 'none', letterSpacing: '0.15em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: `0 8px 20px -5px ${GREEN}60`
                  }}>
                    <Rocket size={16} /> Broadcast Request
                  </button>
                </Form>
              </div>
            </Col>
            <Col xs={24} lg={14}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '24px', textTransform: 'none', letterSpacing: '0.05em' }}>Inbound Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {incomingVisits.length > 0 ? incomingVisits.map(visit => (
                  <div key={visit.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{visit.user.name}</h4>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'none', letterSpacing: '0.05em' }}>{visit.project?.title}</span>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 900, background: 'rgba(16,185,129,0.15)', color: GREEN, padding: '4px 8px', borderRadius: '6px', textTransform: 'none' }}>{visit.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
                      {visit.message}
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleUpdateVisitStatus(visit.id, 'APPROVED')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: GREEN, color: 'white', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => handleUpdateVisitStatus(visit.id, 'REJECTED')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>Reject</button>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '60px', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '24px', textAlign: 'center' }}>
                    <History size={40} color="rgba(255,255,255,0.05)" style={{ marginBottom: '16px' }} />
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: '0.1em' }}>No pending requests</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}

        {activeTab === '3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {broadcasts.length > 0 ? broadcasts.map(req => (
              <div 
                key={req.id}
                style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '24px', padding: '32px', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', md: 'row', justifyContent: 'space-between', gap: '32px' }}>
                  <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                       <span style={{ fontSize: '9px', fontWeight: 900, background: 'rgba(16,185,129,0.15)', color: GREEN, padding: '4px 10px', borderRadius: '6px', textTransform: 'none', letterSpacing: '0.1em' }}>Active Mission</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Activity size={12} color={GREEN} />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.05em' }}>Critical Deployment</span>
                       </div>
                    </div>
                    <h3 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>{req.location}</h3>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} color={GREEN} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{req.duration}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} color={GREEN} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Eng: {req.engineer.name}</span>
                      </div>
                    </div>
                    {req.details && (
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{req.details}"
                      </p>
                    )}
                  </div>
                  
                  <div style={{ minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Mission Bounty</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 900, color: GREEN }}>$</span>
                        <span style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{req.price}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAcceptHire(req.id)}
                      style={{
                        padding: '16px 32px', borderRadius: '14px', border: 'none',
                        background: GREEN, color: 'white', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 900, textTransform: 'none', letterSpacing: '0.1em',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        boxShadow: `0 8px 20px -5px ${GREEN}60`
                      }}
                    >
                      <CheckCircle size={18} /> Accept Mission
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <Empty description={<span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 800, fontSize: '11px', textTransform: 'none', letterSpacing: '0.2em' }}>No active opportunities</span>} />
              </div>
            )}
          </div>
        )}

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
