import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Row, Col, Input, 
  Select, Tag, Space, Button, 
  Empty, Badge, Avatar, Divider, Tooltip,
  Carousel, Image 
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
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filterRole, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [engRes, projRes] = await Promise.all([
        api.get('/network/engineers'),
        api.get('/network/projects')
      ]);
      setEngineers(engRes.data);
      setProjects(projRes.data);
    } catch (error) {
      console.error("Fetch data error:", error);
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
    return path.startsWith('http') ? path : `http://localhost:3001${path}`;
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: 1400, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <Title level={1} style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 800, letterSpacing: -1 }}>
          Sovereign Minds <span style={{ color: '#10b981' }}>Network</span>
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: 700, margin: '0 auto' }}>
          Connect with the architects of African sovereignty. Verified engineers, urbanists, and visionaries ready to actualize your infrastructure goals.
        </Paragraph>
        
        {/* Advanced Search Bar */}
        <div style={{ 
          maxWidth: 900, 
          margin: '40px auto 0', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '24px', 
          borderRadius: '100px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <Input 
            placeholder="Search experts, domains, or projects..." 
            prefix={<SearchOutlined style={{ color: '#10b981' }} />} 
            style={{ width: 400, borderRadius: 50, height: 50, background: 'rgba(0,0,0,0.2)', color: '#fff', border: 'none' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Select 
            placeholder="Expertise" 
            style={{ width: 180, height: 50 }} 
            allowClear 
            onChange={setFilterRole}
            className="custom-select"
          >
            <Option value="ENGINEER">Engineer</Option>
            <Option value="ARCHITECT">Architect</Option>
            <Option value="QUANTITY_SURVEYOR">Quantity Surveyor</Option>
          </Select>
          <Button type="primary" style={{ height: 50, borderRadius: 50, padding: '0 40px', fontWeight: 600 }}>
            Find Solutions
          </Button>
        </div>
      </div>

      <Row gutter={[48, 48]}>
        {/* ENGINEERS SECTION */}
        <Col xs={24} lg={10}>
          <div style={{ marginBottom: 32 }}>
            <Title level={3} style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
              <UserOutlined style={{ color: '#10b981' }} /> Verified Experts
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.45)' }}>High-integrity professionals with proven pan-African track records.</Text>
          </div>
          
          {filteredEngineers.length > 0 ? (
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
              {filteredEngineers.map(engineer => (
                <Card 
                  key={engineer.id} 
                  className="glass-card premium-hover" 
                  bodyStyle={{ padding: 24 }}
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ display: 'flex', gap: 20, alignItems: 'start' }}>
                    <Avatar 
                      size={80} 
                      src={getServerUrl(engineer.avatarUrl)} 
                      icon={<UserOutlined />} 
                      style={{ background: 'linear-gradient(135deg, #4A7FA7 0%, #1A3D63 100%)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Title level={4} style={{ margin: 0, color: '#fff' }}>
                            {engineer.user.name} 
                            {engineer.isVerified && <Tooltip title="Verified Professional"><SafetyCertificateOutlined style={{ color: '#10b981', marginLeft: 8 }} /></Tooltip>}
                          </Title>
                          <Text style={{ color: '#10b981', fontWeight: 600 }}>{engineer.specialization || 'Strategic Visionary'}</Text>
                        </div>
                      </div>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 14, lineHeight: 1.6 }} ellipsis={{ rows: 3 }}>
                        {engineer.bio || "Crafting the infrastructure of a sovereign future. Specializing in sustainable development and smart systems group-wide."}
                      </Paragraph>
                      
                      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size="small" wrap>
                          {engineer.skills.slice(0, 3).map((skill: string) => (
                            <Tag key={skill} style={{ borderRadius: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: 11 }}>
                              {skill}
                            </Tag>
                          ))}
                        </Space>
                        {engineer.resumeUrl && (
                          <Button 
                            type="link" 
                            icon={<DownloadOutlined />} 
                            href={getServerUrl(engineer.resumeUrl)} 
                            target="_blank"
                            style={{ color: '#4A7FA7' }}
                          >
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
             <Empty description={<Text style={{ color: 'rgba(255,255,255,0.3)' }}>No experts found</Text>} />
          )}
        </Col>

        {/* PROJECTS SECTION */}
        <Col xs={24} lg={14}>
          <div style={{ marginBottom: 32 }}>
            <Title level={3} style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
              <ProjectOutlined style={{ color: '#10b981' }} /> Active Infrastructure
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.45)' }}>Showcasing high-impact projects across Africa's developing landscape.</Text>
          </div>

          <Row gutter={[24, 24]}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <Col xs={24} key={project.id}>
                  <Card 
                    className="glass-card" 
                    bodyStyle={{ padding: 0 }}
                    style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <Row>
                      <Col xs={24} md={10}>
                         <div style={{ height: '100%', minHeight: 250 }}>
                            {project.images && project.images.length > 0 ? (
                              <Carousel autoplay speed={1000} dots={false}>
                                {project.images.map((img: any) => (
                                  <div key={img.id}>
                                    <Image 
                                      src={getServerUrl(img.imageUrl)} 
                                      alt={img.caption} 
                                      style={{ height: 250, width: '100%', objectFit: 'cover' }}
                                      preview={false}
                                    />
                                  </div>
                                ))}
                              </Carousel>
                            ) : (
                              <div style={{ height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Image 
                                  src={getServerUrl(project.imageUrl)} 
                                  style={{ height: 250, width: '100%', objectFit: 'cover' }} 
                                  fallback="https://via.placeholder.com/400x250?text=QSI+Project"
                                />
                              </div>
                            )}
                         </div>
                      </Col>
                      <Col xs={24} md={14}>
                        <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Title level={4} style={{ margin: 0, color: '#fff' }}>{project.title}</Title>
                            <Tag color={project.status === 'COMPLETED' ? 'green' : project.status === 'IN_PROGRESS' ? 'blue' : 'orange'}>
                              {project.status}
                            </Tag>
                          </div>
                          <Text style={{ color: '#10b981', display: 'block', margin: '8px 0' }}>Lead: {project.engineerProfile.user.name}</Text>
                          <Paragraph style={{ color: 'rgba(255,255,255,0.45)', flex: 1, fontSize: 14 }}>
                            {project.description}
                          </Paragraph>
                          
                          <Divider style={{ margin: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }} />
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button 
                              type="primary" 
                              icon={<ArrowRightOutlined />}
                              onClick={() => navigate('/mobility')}
                              style={{ background: '#111', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                              Experience Site Visit
                            </Button>
                            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                              <EnvironmentOutlined /> Multiple Locations
                            </Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description={<Text style={{ color: 'rgba(255,255,255,0.3)' }}>No projects available for display</Text>} />
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SovereignMindsPage;
