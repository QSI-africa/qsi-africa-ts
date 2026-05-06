// src/pages/SmartCityDemosPage.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Button, theme, Tag } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { LuFrame } from "react-icons/lu";

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

const SmartCityDemosPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();
  const { token } = useToken();

  // Fetch demos on component mount
  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://api.qsi.africa/api";

        const response = await axios.get(`${baseURL}/submit/demos`);

        if (Array.isArray(response.data)) {
          setFrameworks(response.data);
        } else {
          setError("Received invalid data format for demonstrators.");
          setFrameworks([]);
        }
      } catch (err) {
        setError("Could not load demonstrators. Please try again later.");
        setFrameworks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFrameworks();
  }, []);

  const handleCardClick = (id: string) => {
    navigate(`/demos/${id}`);
  };

  return (
    <div
      style={{
        background: "var(--canvas-white)",
        minHeight: "100vh",
        width: "100%",
        padding: "0",
      }}
    >
      {/* Hero Section with Pattern */}
      <div 
        className="pattern-dots"
        style={{
          padding: "100px 5% 60px 5%",
          borderBottom: "2px solid var(--onyx-black)",
          textAlign: "left",
          position: "relative"
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow reveal-up">Physical Infrastructure</span>
          <Title
            level={1}
            className="reveal-up"
            style={{ 
              fontSize: "clamp(48px, 8vw, 120px)", 
              margin: "0 0 24px 0",
              color: "var(--onyx-black)"
            }}
          >
            SMART <br /> CITY DEMOS
          </Title>
          <div className="grid-border-t grid-border-emerald" style={{ paddingTop: '24px', maxWidth: '600px' }}>
            <Paragraph
              className="reveal-up"
              style={{
                fontSize: "18px",
                color: "var(--onyx-black)",
                maxWidth: "600px",
                fontFamily: "var(--font-body)"
              }}
            >
              These are physical Smart City demonstrators. Where the future of African urbanism is lived, not just imagined.
            </Paragraph>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: "60px", paddingBottom: "100px" }}>
        {/* Loading State */}
        {loading && (
          <div className="flex-center" style={{ padding: "100px 0" }}>
            <Spin size="large" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex-center" style={{ padding: "100px 0", flexDirection: 'column' }}>
            <Text type="danger" style={{ fontSize: '18px', marginBottom: '24px' }}>{error}</Text>
            <Button className="afro-button" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Demo Cards Grid */}
        {!loading && !error && (
          <Row gutter={[32, 32]}>
            {frameworks.length > 0 ? (
              frameworks.map((demo) => (
                <Col key={demo.id} xs={24} md={12} lg={8}>
                  <Card
                    className="geometric-card reveal-up"
                    style={{ height: "100%", borderRadius: 0 }}
                    onClick={() => handleCardClick(demo.id)}
                    bodyStyle={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      padding: "0",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ paddingBottom: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          background: 'var(--baobab-emerald)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <LuFrame size={20} />
                        </div>
                        {demo.status && (
                          <Tag 
                            style={{ 
                              margin: 0, 
                              borderRadius: 0, 
                              border: '1px solid var(--onyx-black)',
                              background: demo.status === 'ACTIVE' ? 'var(--baobab-emerald)' : 'var(--ochre-yellow)',
                              color: 'white',
                              fontFamily: 'var(--font-accent)',
                              fontSize: '10px'
                            }}
                          >
                            {demo.status}
                          </Tag>
                        )}
                      </div>

                      <Title level={3} style={{ marginBottom: "16px", textTransform: 'uppercase' }}>
                        {demo.title}
                      </Title>

                      {demo.city && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <EnvironmentOutlined style={{ color: 'var(--terracotta-clay)' }} />
                          <Text style={{ fontFamily: 'var(--font-accent)', fontSize: '12px', textTransform: 'uppercase' }}>
                            {demo.city}
                          </Text>
                        </div>
                      )}

                      <Paragraph
                        style={{
                          fontSize: "16px",
                          color: "var(--onyx-black)",
                          marginBottom: "0",
                          fontFamily: "var(--font-body)",
                          opacity: 0.8
                        }}
                        ellipsis={{ rows: 3 }}
                      >
                        {demo.shortDescription}
                      </Paragraph>
                    </div>

                    <div 
                      className="grid-border-t" 
                      style={{ 
                        paddingTop: '24px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}
                    >
                      <span className="eyebrow" style={{ margin: 0 }}>View Prototype</span>
                      <ArrowRightOutlined style={{ fontSize: '20px', color: 'var(--baobab-emerald)' }} />
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24} className="flex-center" style={{ padding: "100px 0" }}>
                <Text className="eyebrow">No demonstrators found.</Text>
              </Col>
            )}
          </Row>
        )}
      </div>
    </div>
  );
};

export default SmartCityDemosPage;
