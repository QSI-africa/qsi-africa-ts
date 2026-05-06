import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Row, Col, Input, 
  Select, Tag, Space, Button, 
  Empty, Badge, Tabs, Spin, Skeleton, Alert
} from 'antd';
import { 
  SearchOutlined, 
  SafetyCertificateOutlined, 
  GlobalOutlined 
} from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SovereignMindsPage: React.FC = () => {
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/network/engineers');
      setEngineers(response.data);
    } catch (err: any) {
      console.error("Fetch data error:", err);
      setError("Failed to load network data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEngineers = useMemo(() => {
    let result = engineers.filter(eng => 
      eng.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eng.specialization && eng.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (activeTab === 'SOVEREIGN') {
      result = result.filter(eng => eng.isVerified);
    } else if (activeTab === 'PROFESSIONALS') {
      result = result.filter(eng => !eng.isVerified);
    }

    return result;
  }, [engineers, searchQuery, activeTab]);

  const getServerUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `https://api.qsi.africa${path}`;
  };

  return (
    <div style={{ background: "var(--canvas-white)", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div 
        className="pattern-mudcloth"
        style={{
          padding: "160px 5% 80px 5%",
          borderBottom: "3px solid var(--onyx-black)",
          textAlign: "left",
          position: "relative"
        }}
      >
        <div className="container" style={{ padding: 0 }}>
          <span className="eyebrow reveal-up" style={{ color: 'var(--baobab-emerald)' }}>Ecosystem of Excellence</span>
          <Title
            level={1}
            className="reveal-up"
            style={{ 
              fontSize: "clamp(48px, 8vw, 100px)", 
              margin: "12px 0 32px 0",
              color: "var(--onyx-black)",
              textTransform: 'uppercase',
              fontWeight: 900,
              letterSpacing: '-0.02em'
            }}
          >
            SOVEREIGN <br /> MINDS
          </Title>
          <div className="grid-border-t grid-border-emerald" style={{ paddingTop: '32px', maxWidth: '800px' }}>
            <Paragraph
              className="reveal-up"
              style={{
                fontSize: "22px",
                color: "var(--onyx-black)",
                maxWidth: "750px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                lineHeight: 1.5
              }}
            >
              A collective of decolonized thinkers driving mental transformation and intellectual leadership across the continent.
            </Paragraph>
          </div>

          {/* Search Bar */}
          <div className="reveal-up" style={{ marginTop: '64px', maxWidth: '1100px' }}>
            <div style={{ display: 'flex', gap: '2px', background: 'var(--onyx-black)', border: '3px solid var(--onyx-black)', boxShadow: '12px 12px 0px var(--onyx-black)' }}>
              <Input 
                placeholder="Search by name, expertise, or mission..." 
                prefix={<SearchOutlined style={{ color: 'var(--baobab-emerald)', fontSize: '20px' }} />} 
                style={{ flex: 1, height: '72px', border: 'none', borderRadius: 0, fontSize: '18px', paddingLeft: '24px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button 
                className="afro-button primary" 
                style={{ height: '72px', border: 'none', padding: '0 48px', fontSize: '16px' }}
              >
                SEARCH NETWORK
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container section-py">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          className="bauhaus-tabs"
          style={{ marginBottom: '64px' }}
        >
          <TabPane tab="ALL MEMBERS" key="ALL" />
          <TabPane tab="SOVEREIGN MINDS (VERIFIED)" key="SOVEREIGN" />
          <TabPane tab="PROFESSIONAL PORTALS" key="PROFESSIONALS" />
        </Tabs>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 48, borderRadius: 0, border: '3px solid var(--terracotta-clay)' }} />
        )}

        {loading ? (
          <Row gutter={[40, 40]}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} lg={12} key={i}>
                <Skeleton active avatar paragraph={{ rows: 4 }} />
              </Col>
            ))}
          </Row>
        ) : filteredEngineers.length > 0 ? (
          <Row gutter={[40, 40]}>
            {filteredEngineers.map(engineer => (
              <Col xs={24} lg={12} key={engineer.id}>
                <ProfileCard 
                  id={engineer.id}
                  name={engineer.user.name}
                  role={engineer.user.role}
                  specialization={engineer.specialization}
                  bio={engineer.bio}
                  skills={engineer.skills}
                  avatarUrl={getServerUrl(engineer.avatarUrl)}
                  isVerified={engineer.isVerified}
                  onClick={(id) => navigate(`/profiles/${id}`)}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={<Text className="eyebrow" style={{ fontSize: '16px' }}>No matches found in this category</Text>} 
          />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bauhaus-tabs .ant-tabs-nav-list {
          gap: 32px;
        }
        .bauhaus-tabs .ant-tabs-tab {
          padding: 16px 0 !important;
          margin: 0 !important;
        }
        .bauhaus-tabs .ant-tabs-tab-btn {
          font-family: var(--font-accent) !important;
          text-transform: uppercase !important;
          letter-spacing: 0.15em !important;
          font-weight: 900 !important;
          font-size: 13px !important;
          color: var(--ash-grey) !important;
        }
        .bauhaus-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--onyx-black) !important;
        }
        .bauhaus-tabs .ant-tabs-ink-bar {
          background: var(--baobab-emerald) !important;
          height: 6px !important;
        }
      `}} />
    </div>
  );
};

export default SovereignMindsPage;
