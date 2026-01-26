// src/pages/QsiConceptsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Typography, Spin, Button, theme } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  RocketOutlined,
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  const { token } = useToken();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: React.FormEvent) => {
      // safe cast or ignore
      const event = e as unknown as React.MouseEvent;
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };

    // @ts-ignore
    window.addEventListener("mousemove", handleMouseMove);
    // @ts-ignore
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch pilots on component mount
  useEffect(() => {
    const fetchPilots = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://api.qsi.africa/api";
        // Call new endpoint
        const response = await axios.get(`${baseURL}/submit/concepts`);
        if (Array.isArray(response.data)) {
          setPilots(response.data);
        } else {
          console.error("Fetched concept data is not an array:", response.data);
          setError("Received invalid data format for concepts.");
          setPilots([]);
        }
      } catch (err) {
        console.error("Failed to fetch concepts:", err);
        setError("Could not load concepts. Please try again later.");
        setPilots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPilots();
  }, []);

  // Filter pilots based on search term (case-insensitive)
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

  const getBackgroundGradient = () => {
    return `
      radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${
      token.colorPrimary
    }20 20%,  ${token.colorBgContainer} 60%),
      radial-gradient(circle at ${100 - mousePosition.x}% ${
      100 - mousePosition.y
    }%, ${token.colorSuccess}10 0%,  ${token.colorBgContainer} 40%),
      ${token.colorBgContainer}
    `;
  };

  return (
    <div
      style={{
        padding: "clamp(15px, 4vw, 30px)",
        background: getBackgroundGradient(),
        overflowY: "auto",
        height: "100vh",
        width: "100%",
        margin: "0px auto 0 auto",
      }}
    >
      {/* Back Button */}
      <Link to="/">
        <Button
          icon={<ArrowLeftOutlined />}
          style={{
            marginBottom: "20px",
            position: "absolute",
            top: "20px",
            left: "20px",
            background: token.colorBgBase,
          }}
        >
          Back to Home
        </Button>
      </Link>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
      <Title strong level={2} style={{ textAlign: "center", marginTop: "60px", marginBottom: "0" }}>
        QSI Concepts
      </Title>
      <Title level={5} style={{ textAlign: "center", marginTop: "0px", padding:"0 20px", color: token.colorPrimary, fontWeight: "400" }}>
        Culture engineered for the future
      </Title>
      <Paragraph
        style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "10px 20px",
        }}
        type="secondary"
      >
        These are brand-anchored or investable innovation concepts that merge
        culture, technology, and consciousness. Each concept operates as a
        unique franchise or collaborative venture under QSI governance.
      </Paragraph>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Text type="danger" style={{ display: "block", textAlign: "center" }}>
          {error}
        </Text>
      )}

      {/* Pilot Cards Grid */}
      {!loading && !error && (
        <Row
          gutter={[12, 12]}
          style={{
            marginBottom: "30px",
          }}
        >
          {filteredPilots.length > 0 ? (
            filteredPilots.map((pilot) => (
              <Col key={pilot.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(pilot.id)}
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: token.colorBgBase,
                  }}
                  bodyStyle={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <Title level={5} style={{ marginBottom: "8px" }}>
                      <BulbOutlined
                        style={{
                          marginRight: "8px",
                          color: token.colorPrimary,
                        }}
                      />
                      {pilot.title}
                    </Title>
                    <Paragraph
                      type="secondary"
                      style={{
                        fontSize: "14px",
                        flexGrow: 1,
                        marginBottom: "16px",
                      }}
                      ellipsis={{ rows: 3 }}
                    >
                      {/* Concepts use description */}
                      {pilot.description}
                    </Paragraph>
                  </div>
                  <Text
                    style={{
                      color: token.colorPrimary,
                      fontWeight: "500",
                      alignSelf: "flex-start",
                    }}
                  >
                    View Details <ArrowRightOutlined />
                  </Text>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: "center" }}>
              <Text type="secondary">
                No concepts found.
              </Text>
            </Col>
          )}
        </Row>
      )}
      </div>
    </div>
  );
};

export default QsiConceptsPage;
