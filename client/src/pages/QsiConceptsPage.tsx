// src/pages/QsiConceptsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Spin, Button, theme } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BulbOutlined
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

const QsiConceptsPage: React.FC = () => {
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [searchTerm] = useState<string>("");
  const navigate = useNavigate();
  const { token } = useToken();

  // Fetch concepts on component mount
  useEffect(() => {
    const fetchConcepts = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
        const response = await axios.get(`${baseURL}/submit/concepts`);

        if (Array.isArray(response.data)) {
          setPilots(response.data);
        } else {
          setError("Received invalid data format for concepts.");
          setPilots([]);
        }
      } catch (err) {
        console.error("Failed to fetch concepts:", err);
        setError("Could not load concepts.");
        setPilots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConcepts();
  }, []);

  // Filter pilots based on search term
  const filteredPilots = useMemo(() => {
    if (!searchTerm) {
      return pilots;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return pilots.filter(
      (pilot) =>
        pilot.title?.toLowerCase().includes(lowerSearchTerm) ||
        pilot.description?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [pilots, searchTerm]);

  const handleCardClick = (id: string) => {
    navigate(`/concepts/${id}`);
  };

  return (
    <div style={{ background: "var(--canvas-white)", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div 
        className="pattern-mudcloth"
        style={{
          padding: "120px 5% 60px 5%",
          borderBottom: "2px solid var(--onyx-black)",
          position: "relative"
        }}
      >
        <div className="container" style={{ padding: 0 }}>
          <span className="eyebrow reveal-up">Culture Engineered</span>
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
            QSI <br /> CONCEPTS
          </Title>
          <div className="grid-border-t grid-border-emerald" style={{ paddingTop: '24px', maxWidth: '800px' }}>
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
              These are brand-anchored or investable innovation concepts that merge culture, technology, and consciousness. Each concept operates as a unique franchise or collaborative venture.
            </Paragraph>
          </div>
        </div>
      </div>

      <div className="container section-py">
        {loading && (
          <div style={{ textAlign: "center", padding: "100px" }}>
            <Spin size="large" />
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "40px", border: '2px solid var(--onyx-black)' }}>
            <Text type="danger" className="eyebrow">{error}</Text>
          </div>
        )}

        {!loading && !error && (
          <Row gutter={[32, 32]}>
            {filteredPilots.length > 0 ? (
              filteredPilots.map((pilot) => (
                <Col key={pilot.id} xs={24} sm={12} md={8}>
                  <Card
                    className="geometric-card reveal-up"
                    onClick={() => handleCardClick(pilot.id)}
                    bodyStyle={{
                      padding: "32px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      justifyContent: "space-between",
                    }}
                    style={{ 
                      height: "100%", 
                      border: '2px solid var(--onyx-black)',
                      borderRadius: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <BulbOutlined style={{ color: 'var(--baobab-emerald)', fontSize: '20px' }} />
                        <span className="eyebrow" style={{ margin: 0 }}>INNOVATION</span>
                      </div>
                      <Title level={4} style={{ marginBottom: "16px", textTransform: 'uppercase' }}>
                        {pilot.title}
                      </Title>
                      <Paragraph
                        style={{
                          fontSize: "15px",
                          color: "var(--onyx-black)",
                          opacity: 0.8,
                          marginBottom: "24px",
                          lineHeight: 1.8
                        }}
                        ellipsis={{ rows: 4 }}
                      >
                        {pilot.shortDescription}
                      </Paragraph>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <Text style={{ color: 'var(--baobab-emerald)', fontWeight: 800, fontFamily: 'var(--font-accent)', fontSize: '12px' }}>
                        EXPLORE CONCEPT
                      </Text>
                      <ArrowRightOutlined style={{ color: 'var(--baobab-emerald)' }} />
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description={<Text className="eyebrow">No concepts found</Text>} />
              </Col>
            )}
          </Row>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .geometric-card:hover {
          border-color: var(--baobab-emerald) !important;
          transform: translateY(-4px);
        }
      `}} />
    </div>
  );
};

export default QsiConceptsPage;
