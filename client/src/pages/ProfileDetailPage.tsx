import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Avatar, Tag, Space, Button, Skeleton, Empty, Image } from 'antd';
import { 
  SafetyCertificateOutlined, 
  ArrowLeftOutlined, 
  GlobalOutlined, 
  ProjectOutlined,
  ThunderboltOutlined,
  ReadOutlined
} from '@ant-design/icons';
import api from '../api';
import { GeometricCard, GridLine, CornerAccent } from '../components/AfroBauhausComponents';

const { Title, Text, Paragraph } = Typography;

const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Reusing the engineers endpoint for profile detail for now
      // In a real app, we'd have a specific /network/profile/:id endpoint
      const response = await api.get('/network/engineers');
      const found = response.data.find((eng: any) => eng.id === id);
      setProfile(found);
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `https://api.qsi.africa${path}`;
  };

  // Mock Insights for Sovereign Minds
  const mockInsights = [
    { id: '1', title: 'Decolonizing the Urban Grid', date: 'Oct 24', category: 'THOUGHT' },
    { id: '2', title: 'Coherence in Infrastructure', date: 'Oct 12', category: 'DESIGN' },
    { id: '3', title: 'The Psychology of Building', date: 'Sep 28', category: 'MENTAL' },
    { id: '4', title: 'Sovereign Resource Loops', date: 'Sep 15', category: 'ECOLOGY' },
  ];

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '160px', minHeight: '100vh' }}>
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ paddingTop: '160px', textAlign: 'center' }}>
        <Empty description="Profile not found" />
        <Button onClick={() => navigate('/network')}>Back to Network</Button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--canvas-white)', minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Hero Section */}
      <section className="pattern-mudcloth" style={{ paddingTop: '160px', paddingBottom: '80px', borderBottom: '3px solid var(--onyx-black)' }}>
        <div className="container">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/network')}
            style={{ marginBottom: '40px', padding: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Back to Network
          </Button>
          
          <div style={{ display: 'flex', gap: '64px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Avatar 
                size={240} 
                src={getServerUrl(profile.avatarUrl)} 
                style={{ 
                  borderRadius: 0, 
                  border: '5px solid var(--onyx-black)',
                  boxShadow: '15px 15px 0px var(--baobab-emerald)',
                  background: 'var(--papyrus-off-white)'
                }}
              />
              {profile.isVerified && (
                <div style={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  background: 'var(--baobab-emerald)', 
                  color: 'white',
                  padding: '12px',
                  border: '3px solid var(--onyx-black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  <SafetyCertificateOutlined style={{ fontSize: '24px' }} />
                </div>
              )}
            </div>
            
            <div style={{ flex: 1, minWidth: '300px' }}>
              <span className="eyebrow" style={{ color: 'var(--baobab-emerald)' }}>
                {profile.isVerified ? 'Sovereign Mind (Verified)' : 'Professional Member'}
              </span>
              <Title level={1} style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', margin: '12px 0', textTransform: 'uppercase', letterSpacing: '-0.02em', fontWeight: 900 }}>
                {profile.user.name}
              </Title>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                <Text style={{ fontSize: '20px', fontWeight: 800, color: 'var(--baobab-emerald)', textTransform: 'uppercase', fontFamily: 'var(--font-accent)' }}>
                  {profile.specialization}
                </Text>
                <div style={{ height: '10px', width: '2px', background: 'var(--onyx-black)' }} />
                <Space>
                  <GlobalOutlined /> <Text style={{ fontWeight: 700 }}>Pan-African Ecosystem</Text>
                </Space>
              </div>
              <Paragraph style={{ fontSize: '18px', maxWidth: '700px', lineHeight: 1.6, fontWeight: 500 }}>
                {profile.bio || "Dedicated to building the foundations of a sovereign and prosperous African future through excellence in infrastructure and thought leadership."}
              </Paragraph>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Contributions Section */}
      <section className="section-py grid-border-b">
        <div className="container">
          <div style={{ marginBottom: '64px' }}>
            <span className="eyebrow">Practical Contribution</span>
            <Title level={2} style={{ textTransform: 'uppercase', fontSize: '3rem' }}>Project <span style={{ color: 'var(--baobab-emerald)' }}>Ledger</span></Title>
            <Paragraph style={{ fontSize: '16px', color: 'var(--ash-grey)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Focusing on tangible impact and decolonized engineering outcomes.
            </Paragraph>
          </div>

          <Row gutter={[48, 48]}>
            {profile.projects && profile.projects.length > 0 ? (
              profile.projects.map((proj: any) => (
                <Col xs={24} md={12} key={proj.id}>
                  <GeometricCard style={{ padding: 0, height: '100%' }}>
                    <div style={{ height: '300px', borderBottom: '3px solid var(--onyx-black)' }}>
                      <Image 
                        src={getServerUrl(proj.imageUrl)} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview={false}
                      />
                    </div>
                    <div style={{ padding: '40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Title level={3} style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.5rem' }}>{proj.title}</Title>
                        <Tag style={{ borderRadius: 0, background: 'var(--onyx-black)', color: 'white', border: 'none' }}>{proj.status}</Tag>
                      </div>
                      <Paragraph style={{ fontSize: '15px', color: 'var(--onyx-black)', opacity: 0.8, marginBottom: '32px' }}>
                        {proj.description}
                      </Paragraph>
                      <div className="grid-border-t" style={{ paddingTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                        <Space><ProjectOutlined /> <Text className="eyebrow" style={{ margin: 0 }}>Outcome Verified</Text></Space>
                        <Button type="link" style={{ padding: 0, color: 'var(--baobab-emerald)', fontWeight: 900 }}>VIEW CASE STUDY</Button>
                      </div>
                    </div>
                  </GeometricCard>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '80px', border: '3px dashed var(--ash-grey)' }}>
                  <Title level={4} style={{ color: 'var(--ash-grey)', textTransform: 'uppercase' }}>No Projects Logged Yet</Title>
                  <Text>Contributions are being verified by the QSI Governance Team.</Text>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </section>

      {/* Sovereign Insights (Educational Content) */}
      <section className="section-py pattern-dots">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
            <div>
              <span className="eyebrow">Intellectual Leadership</span>
              <Title level={2} style={{ textTransform: 'uppercase', fontSize: '3rem' }}>Sovereign <span style={{ color: 'var(--baobab-emerald)' }}>Insights</span></Title>
            </div>
            <Button className="afro-button" icon={<ReadOutlined />}>VIEW ALL CONTENT</Button>
          </div>

          <div className="no-scrollbar" style={{ display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '40px', paddingLeft: '4px' }}>
            {mockInsights.map((insight) => (
              <div 
                key={insight.id}
                style={{ 
                  flexShrink: 0, 
                  width: '320px', 
                  backgroundColor: 'var(--canvas-white)', 
                  border: '3px solid var(--onyx-black)',
                  boxShadow: '8px 8px 0px var(--onyx-black)',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '240px',
                  cursor: 'pointer',
                  transition: 'var(--snappy)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '12px 12px 0px var(--baobab-emerald)';
                  e.currentTarget.style.borderColor = 'var(--baobab-emerald)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '8px 8px 0px var(--onyx-black)';
                  e.currentTarget.style.borderColor = 'var(--onyx-black)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <Tag style={{ borderRadius: 0, border: '1px solid var(--onyx-black)', background: 'var(--papyrus-off-white)' }}>{insight.category}</Tag>
                    <Text style={{ fontFamily: 'var(--font-accent)', fontSize: '12px', fontWeight: 900 }}>{insight.date}</Text>
                  </div>
                  <Title level={4} style={{ textTransform: 'uppercase', margin: 0, fontSize: '18px' }}>{insight.title}</Title>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ThunderboltOutlined style={{ fontSize: '24px', color: 'var(--baobab-emerald)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interaction Footer */}
      <section className="section-py pattern-mudcloth" style={{ borderTop: '3px solid var(--onyx-black)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <Title level={3} style={{ textTransform: 'uppercase', marginBottom: '40px' }}>Engage with this Sovereign Mind</Title>
          <Space size="large" wrap>
            <Button className="afro-button primary" size="large" style={{ height: '64px', padding: '0 48px' }}>SCHEDULE CONSULTATION</Button>
            <Button className="afro-button" size="large" style={{ height: '64px', padding: '0 48px' }}>FOLLOW UPDATES</Button>
          </Space>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default ProfileDetailPage;
