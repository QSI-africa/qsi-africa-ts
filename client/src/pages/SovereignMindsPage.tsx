import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Row, Col, Input, 
  Select, Tag, Space, Button, 
  Empty, Badge, Avatar, Divider, Tooltip,
  Carousel, Image, Spin, Skeleton, Alert
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, UserOutlined, 
  SafetyCertificateOutlined, ProjectOutlined, 
  EnvironmentOutlined, RocketOutlined, DownloadOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SovereignMindsPage: React.FC = () => {
  const [engineers, setEngineers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filterRole]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [engRes, projRes] = await Promise.all([
        api.get('/network/engineers'),
        api.get('/network/projects')
      ]);
      setEngineers(engRes.data);
      setProjects(projRes.data);
    } catch (err: any) {
      console.error("Fetch data error:", err);
      setError("Failed to load network data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEngineers = engineers.filter(eng => 
    eng.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (eng.specialization && eng.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredProjects = projects.filter(proj => 
    proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proj.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getServerUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `https://api.qsi.africa${path}`;
  };

  return (
    <div style={{ background: "var(--canvas-white)", minHeight: "100vh" }}>
      {/* Hero Section with Pattern */}
      <div 
        className="pattern-mudcloth"
        style={{
          padding: "120px 5% 60px 5%",
          borderBottom: "2px solid var(--onyx-black)",
          textAlign: "left",
          position: "relative"
        }}
      >
        <div className="container" style={{ padding: 0 }}>
          <span className="eyebrow reveal-up">Network of Sovereignty</span>
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
            SOVEREIGN <br /> MINDS
          </Title>
          <div className="grid-border-t grid-border-emerald" style={{ paddingTop: '24px', maxWidth: '800px' }}>
            <Paragraph
              className="reveal-up"
              style={{
                fontSize: "20px",
                color: "var(--onyx-black)",
                maxWidth: "700px",
                fontFamily: "var(--font-body)",
                fontWeight: 500
              }}
            >
              Connect with the architects of African sovereignty. Verified engineers, urbanists, and visionaries ready to actualize the continent's infrastructure goals.
            </Paragraph>
          </div>

          {/* Search Bar */}
          <div className="reveal-up" style={{ marginTop: '48px', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', gap: '2px', background: 'var(--onyx-black)', border: '2px solid var(--onyx-black)' }}>
              <Input 
                placeholder="Search experts or projects..." 
                prefix={<SearchOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
                style={{ flex: 1, height: '60px', border: 'none', borderRadius: 0, fontSize: '16px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Select 
                placeholder="Expertise" 
                style={{ width: '200px', height: '60px' }} 
                allowClear 
                onChange={setFilterRole}
                className="afro-select"
                dropdownStyle={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }}
              >
                <Option value="ENGINEER">Engineer</Option>
                <Option value="ARCHITECT">Architect</Option>
                <Option value="QUANTITY_SURVEYOR">Quantity Surveyor</Option>
              </Select>
              <Button className="afro-button primary" style={{ height: '60px', border: 'none' }}>
                SEARCH
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container section-py">
        <Row gutter={[64, 64]}>
          {/* ENGINEERS SECTION */}
          <Col xs={24} lg={10}>
            <div style={{ marginBottom: 48 }}>
              <span className="eyebrow">Verified Professionals</span>
              <Title level={2} style={{ textTransform: 'uppercase', marginBottom: '16px' }}>EXPERTS</Title>
              <div className="grid-border-t grid-border-emerald" style={{ width: '60px', marginBottom: '24px' }} />
            </div>
            
            {error ? (
              <Alert message={error} type="error" showIcon style={{ marginBottom: 24, borderRadius: 0, border: '2px solid var(--terracotta-clay)' }} />
            ) : loading ? (
              <Space direction="vertical" style={{ width: '100%' }} size={32}>
                {[1, 2, 3].map(i => (
                  <Card key={i} style={{ border: '2px solid var(--onyx-black)', borderRadius: 0 }}>
                    <Skeleton avatar active paragraph={{ rows: 3 }} />
                  </Card>
                ))}
              </Space>
            ) : filteredEngineers.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size={32}>
                {filteredEngineers.map(engineer => (
                  <Card 
                    key={engineer.id} 
                    className="geometric-card reveal-up" 
                    bodyStyle={{ padding: 0 }}
                    style={{ border: '2px solid var(--onyx-black)', borderRadius: 0 }}
                  >
                    <div style={{ display: 'flex', gap: 24, alignItems: 'start', padding: '32px' }}>
                      <Avatar 
                        size={80} 
                        src={getServerUrl(engineer.avatarUrl)} 
                        icon={<UserOutlined />} 
                        style={{ 
                          borderRadius: 0, 
                          border: '2px solid var(--onyx-black)',
                          background: 'var(--papyrus-off-white)'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '12px' }}>
                          <Title level={4} style={{ margin: 0, textTransform: 'uppercase' }}>
                            {engineer.user.name} 
                            {engineer.isVerified && <SafetyCertificateOutlined style={{ color: 'var(--baobab-emerald)', marginLeft: 8 }} />}
                          </Title>
                          <Text style={{ color: 'var(--baobab-emerald)', fontWeight: 800, fontFamily: 'var(--font-accent)', fontSize: '12px', textTransform: 'uppercase' }}>
                            {engineer.specialization || 'Strategic Visionary'}
                          </Text>
                        </div>
                        <Paragraph style={{ color: 'var(--onyx-black)', fontSize: 14, opacity: 0.8 }} ellipsis={{ rows: 3 }}>
                          {engineer.bio || "Crafting the infrastructure of a sovereign future. Specializing in sustainable development."}
                        </Paragraph>
                        
                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space size="small" wrap>
                            {engineer.skills.slice(0, 3).map((skill: string) => (
                              <Tag key={skill} style={{ borderRadius: 0, border: '1px solid var(--onyx-black)', background: 'white', color: 'var(--onyx-black)', fontFamily: 'var(--font-accent)', fontSize: '10px' }}>
                                {skill}
                              </Tag>
                            ))}
                          </Space>
                          <Button className="afro-button" style={{ padding: '4px 12px', height: 'auto', fontSize: '11px' }} onClick={() => navigate(`/chat/vision?expert=${engineer.id}`)}>
                            CONSULT
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </Space>
            ) : (
               <Empty description={<Text className="eyebrow">No experts found</Text>} />
            )}
          </Col>

          {/* PROJECTS SECTION */}
          <Col xs={24} lg={14}>
            <div style={{ marginBottom: 48 }}>
              <span className="eyebrow">Impact Showcase</span>
              <Title level={2} style={{ textTransform: 'uppercase', marginBottom: '16px' }}>ACTIVE PROJECTS</Title>
              <div className="grid-border-t grid-border-emerald" style={{ width: '60px', marginBottom: '24px' }} />
            </div>

            {error ? null : loading ? (
              <Row gutter={[32, 32]}>
                {[1, 2].map(i => (
                  <Col xs={24} key={i}>
                    <Card style={{ border: '2px solid var(--onyx-black)', borderRadius: 0 }}>
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : filteredProjects.length > 0 ? (
              <Row gutter={[32, 32]}>
                {filteredProjects.map(project => (
                  <Col xs={24} key={project.id}>
                    <Card 
                      className="geometric-card reveal-up" 
                      bodyStyle={{ padding: 0 }}
                      style={{ border: '2px solid var(--onyx-black)', borderRadius: 0, overflow: 'hidden' }}
                    >
                      <Row>
                        <Col xs={24} md={10}>
                          <div style={{ height: '100%', borderRight: '2px solid var(--onyx-black)' }}>
                            <Image 
                              src={getServerUrl(project.imageUrl)} 
                              style={{ height: '100%', minHeight: 300, width: '100%', objectFit: 'cover' }} 
                              fallback="https://via.placeholder.com/400x300?text=QSI+Infrastructure"
                              preview={false}
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={14}>
                          <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                              <Title level={3} style={{ margin: 0, textTransform: 'uppercase' }}>{project.title}</Title>
                              <Tag 
                                style={{ 
                                  borderRadius: 0, 
                                  border: '1px solid var(--onyx-black)',
                                  background: 'var(--onyx-black)',
                                  color: 'white',
                                  fontFamily: 'var(--font-accent)',
                                  fontSize: '10px'
                                }}
                              >
                                {project.status}
                              </Tag>
                            </div>
                            <Paragraph style={{ color: 'var(--onyx-black)', fontSize: 15, lineHeight: 1.8, opacity: 0.8, flex: 1 }}>
                              {project.description}
                            </Paragraph>
                            
                            <div className="grid-border-t" style={{ marginTop: '32px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <EnvironmentOutlined style={{ color: 'var(--terracotta-clay)' }} />
                                <span className="eyebrow" style={{ margin: 0 }}>PAN-AFRICAN SITE</span>
                              </div>
                              <Button 
                                className="afro-button"
                                icon={<ArrowRightOutlined />}
                                onClick={() => navigate('/demos')}
                              >
                                VIEW DEMO
                              </Button>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description={<Text className="eyebrow">No projects found</Text>} />
            )}
          </Col>
        </Row>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .afro-select .ant-select-selector {
          border: none !important;
          border-radius: 0 !important;
          background: white !important;
          height: 60px !important;
          display: flex !important;
          align-items: center !important;
          font-family: var(--font-accent) !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 11px !important;
        }

        .geometric-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .geometric-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 12px 12px 0px var(--baobab-emerald) !important;
          border-color: var(--baobab-emerald) !important;
        }

        .geometric-card:hover .ant-avatar {
          border-color: var(--baobab-emerald) !important;
          transform: scale(1.05);
        }
      `}} />
    </div>
  );
};

export default SovereignMindsPage;
