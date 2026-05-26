import React, { useState, useEffect } from 'react';
import { 
  Typography, Row, Col, Modal, Form, Input, 
  notification, Select, Spin, Empty
} from 'antd';
import { 
  Heart, 
  ShieldCheck, 
  Zap, 
  Star,
  CheckCircle2,
  Info,
  MessageCircle,
  Activity,
  ArrowRight,
  User,
  Coffee,
  Sparkles,
  Waves,
  Brain,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const GREEN = '#10B981';

const HealingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInquiryModalVisible, setIsInquiryModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPackages();
    fetchSuggestions();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get('/admin/healing-packages');
      setPackages(response.data.filter((p: any) => p.isActive));
    } catch (error) {
      console.error("Fetch packages error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/submit/healing-suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error("Fetch suggestions error:", error);
    }
  };

  const handleInquiry = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsInquiryModalVisible(true);
  };

  const onFinishInquiry = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/logic/healing-inquiry', {
        ...values,
        packageId: selectedPackage?.id
      });
      notification.success({
        message: 'Inquiry Received',
        description: 'The QSI Healing Team will connect with you shortly for a personalized trajectory scan.',
        placement: 'bottomRight'
      });
      setIsInquiryModalVisible(false);
      form.resetFields();
    } catch (error) {
      notification.error({ message: 'Submission Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${GREEN}18`, border: `1px solid ${GREEN}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
          }}>
            <Heart size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              HEALING
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              Wisdom & Restoration
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Hero Section */}
        <div 
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-10 md:p-12 relative"
          style={{
            borderRadius: '24px', overflow: 'hidden',
            background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${GREEN}20`, marginBottom: '40px'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
              Holistic Sovereignty
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-5">
              Fix the Mind that<br className="hidden sm:inline" />Builds Infrastructure
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '520px' }}>
              Structural harmony begins within. We provide high-coherence restoration paths for visionaries and engineering teams.
            </p>
          </div>

          <div style={{ flexShrink: 0, color: GREEN, opacity: 0.1, position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }}>
            <Waves size={240} />
          </div>
        </div>

        {/* Systemic Reflections / Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>
              Systemic Reflections & Focus Areas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/chat/healing?prompt=${encodeURIComponent(s.text)}`)}
                  style={{
                    padding: '18px 20px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${GREEN}60`;
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <span>{s.text}</span>
                  <span style={{ color: GREEN, fontSize: '16px', fontWeight: 'bold' }}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Row gutter={[40, 40]}>
          {/* Philosophy Section */}
          <Col xs={24} lg={10}>
             <div 
               className="lg:sticky lg:top-[100px]"
               style={{ 
                 background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', 
                 borderRadius: '24px', padding: '32px'
               }}
             >
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  The QSI Approach
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {[
                    { title: 'Frequency Alignment', icon: <Zap size={18} />, desc: 'Synchronizing personal goals with organizational trajectory.' },
                    { title: 'Trauma Synthesis', icon: <Heart size={18} />, desc: 'Converting historical bottlenecks into fuel for innovation.' },
                    { title: 'Sovereign Cognition', icon: <Brain size={18} />, desc: 'De-coupling from limiting mental frameworks.' },
                    { title: 'Relational Coherence', icon: <Coffee size={18} />, desc: 'Building high-trust network interactions.' }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN, flexShrink: 0
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'white', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.title}</h4>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ 
                  marginTop: '40px', padding: '20px', borderRadius: '16px', 
                  background: `${GREEN}08`, borderLeft: `4px solid ${GREEN}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Shield size={14} color={GREEN} />
                    <span style={{ fontSize: '10px', fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Certified Alignment</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                    Practitioners are vetted by the Sovereign Minds Network to ensure Pan-African excellence.
                  </p>
                </div>
             </div>
          </Col>

          {/* Packages Section */}
          <Col xs={24} lg={14}>
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Select Your Path</p>
              <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Specialized Trajectories</h2>
            </div>

            {loading ? (
              <div style={{ padding: '100px 0', textAlign: 'center' }}><Spin /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {packages.map(pkg => (
                  <div 
                    key={pkg.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', height: '320px'
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
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ 
                          fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', 
                          background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' 
                        }}>
                          {pkg.duration}
                        </span>
                        <Sparkles size={14} color={GREEN} style={{ opacity: 0.4 }} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>{pkg.title}</h3>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {pkg.shortPreview}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', display: 'block' }}>Fee</span>
                        <span style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>${pkg.fee}</span>
                      </div>
                      <button 
                        onClick={() => handleInquiry(pkg)}
                        style={{
                          padding: '10px 20px', borderRadius: '10px', border: 'none', background: GREEN, color: 'white',
                          fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer'
                        }}
                      >
                        {pkg.cta || 'Inquire'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ 
              marginTop: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', 
              borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' 
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', color: GREEN, opacity: 0.03 }}>
                <MessageCircle size={160} />
              </div>
              <Row align="middle" gutter={24}>
                <Col xs={24} md={16}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px', textTransform: 'uppercase' }}>Organizational Alignment</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
                    Workshops for engineering teams and visionary organizations looking to scale structural harmony.
                  </p>
                </Col>
                <Col xs={24} md={8}>
                   <button style={{
                     width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid rgba(255,255,255,0.1)`, 
                     background: 'rgba(255,255,255,0.04)', color: 'white', cursor: 'pointer',
                     fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'
                   }}>
                      Contact Team
                   </button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>

      {/* Modal Redesign */}
      <Modal
        title={null}
        open={isInquiryModalVisible}
        onCancel={() => setIsInquiryModalVisible(false)}
        footer={null}
        width={480}
        centered
        className="dark-modal"
        styles={{ content: { background: '#18241E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: 0 } }}
      >
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '14px', background: `${GREEN}15`, border: `1px solid ${GREEN}30`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN, margin: '0 auto 16px' 
            }}>
              <Activity size={24} />
            </div>
            <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>Trajectory Scan</p>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>{selectedPackage?.title}</h3>
          </div>
          
          <Form form={form} layout="vertical" onFinish={onFinishInquiry}>
            <Form.Item 
              name="message" 
              label={<span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Current Evolutionary Phase</span>} 
              rules={[{ required: true, message: 'Please describe your state' }]}
            >
              <Input.TextArea 
                rows={4} 
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '16px', 
                  color: 'white', 
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  resize: 'none',
                  boxShadow: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={e => {
                  e.target.style.borderColor = GREEN;
                  e.target.style.background = 'rgba(16,185,129,0.03)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.target.style.background = 'rgba(255,255,255,0.02)';
                }}
                placeholder="Briefly describe your current journey..." 
              />
            </Form.Item>
            <Form.Item 
              name="preference" 
              label={<span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Session Mode</span>}
            >
              <Select className="custom-select-dark" style={{ width: '100%' }}>
                <Select.Option value="VIDEO">Secure Video (PanX TV)</Select.Option>
                <Select.Option value="AUDIO">High-Fidelity Audio</Select.Option>
                <Select.Option value="TEXT">Async Text Guidance</Select.Option>
              </Select>
            </Form.Item>
            
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: GREEN, color: 'white',
                fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px',
                boxShadow: `0 8px 20px -5px ${GREEN}60`
              }}
            >
              {loading ? 'SYNCHRONIZING...' : 'REQUEST SCAN'} <ArrowRight size={18} />
            </button>
          </Form>
        </div>
      </Modal>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-select-dark .ant-select-selector {
          background: rgba(255,255,255,0.03) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px !important;
          color: white !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-select-dark .ant-select-arrow { color: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
};

export default HealingPage;
