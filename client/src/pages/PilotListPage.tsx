// src/pages/PilotListPage.jsx
import React, { useState, useEffect, useMemo  } from 'react';
import { Row, Col, Card, Typography, Spin, Input, Button, theme } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  RocketOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;

const PilotListPage: React.FC = () => {
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  const { token } = useToken();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: React.FormEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
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
        const response = await axios.get(`${baseURL}/submit/pilots?type=CONCEPT`);
        if (Array.isArray(response.data)) {
          setPilots(response.data);
        } else {
          console.error("Fetched pilot data is not an array:", response.data);
          setError("Received invalid data format for pilots.");
          setPilots([]);
        }
      } catch (err) {
        console.error("Failed to fetch pilot projects:", err);
        setError("Could not load pilot projects. Please try again later.");
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
        pilot.shortDescription?.toLowerCase().includes(lowerSearchTerm) ||
        pilot.key?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [pilots, searchTerm]);

  const handleCardClick = (pilotKey) => {
    navigate(`/pilots/${pilotKey}`);
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
        QSI Powered Concepts
      </Title>
      <Title level={5} style={{ textAlign: "center", marginTop: "0px", padding:"0 20px", color: token.colorPrimary, fontWeight: "400" }}>
        Proprietary Ventures Driving the New Cultural Economy
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
        unique franchise or collaborative venture under QSI governance —
        blending profitability with higher purpose. Once assigned, ownership is
        exclusive and non-replicable.
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
              <Col key={pilot.key || pilot.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(pilot.key)}
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
                      <RocketOutlined
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
                    >
                      {pilot.shortDescription}
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
                No pilot projects found matching your search.
              </Text>
            </Col>
          )}
        </Row>
      )}
      </div>

      <div
        id="footer"
        style={{
          padding: "40px 20px",
          background: "transparent",
          borderRadius: token.borderRadiusLG,
          marginTop: "0px",
          textAlign: "center",
        }}
      >
        <div
          level={4}
          style={{
            color: token.colorTextHeading,
            fontSize: "18px",
            fontWeight: 600,
          }}
        ></div>
      </div>
    </div>
  );
};

export default PilotListPage;
