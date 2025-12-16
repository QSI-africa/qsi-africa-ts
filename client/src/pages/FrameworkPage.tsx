// src/pages/FrameWorkPage.jsx
import React, { useState, useEffect  } from 'react';
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

const FrameWorkPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]); // Renamed state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
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
    const fetchFrameworks = async () => {
      // Renamed function
      setLoading(true);
      setError(null);
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://api.qsi.africa/api";

        // --- MODIFICATION: Added ?type=FRAMEWORK to the API call ---
        const response = await axios.get(
          `${baseURL}/submit/pilots?type=FRAMEWORK`
        );
        // ---------------------------------------------------------

        if (Array.isArray(response.data)) {
          setFrameworks(response.data); // Set frameworks state
        } else {
          console.error(
            "Fetched framework data is not an array:",
            response.data
          );
          setError("Received invalid data format for frameworks.");
          setFrameworks([]);
        }
      } catch (err) {
        console.error("Failed to fetch frameworks:", err);
        setError("Could not load frameworks. Please try again later.");
        setFrameworks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFrameworks();
  }, []);

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
          margin: "0 auto",
        }}
      >
        <Title
          strong
          level={2}
          style={{ textAlign: "center", marginTop: "60px", marginBottom: "0" }}
        >
          QSI Powered Frameworks
        </Title>
        <Title
          level={5}
          style={{
            textAlign: "center",
            marginTop: "0px",
            padding: "0 20px",
            color: token.colorPrimary,
            fontWeight: "400",
          }}
        >
          Scalable Blueprints for Continental Transformation{" "}
        </Title>
        <Paragraph
          style={{
            textAlign: "center",
            marginBottom: "20px",
            padding: "10px 20px",
          }}
          type="secondary"
        >
          These are systemic models of coherence — replicable, adaptive, and
          designed for cities, institutions, and nations evolving toward
          balance. Rooted in resonance, coherence, and the principle of least
          action (Euler–Lagrange), they guide transformation not through
          complexity but through natural alignment between people, systems, and
          the environment.
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
            {frameworks.length > 0 ? (
              frameworks.map((pilot) => (
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

export default FrameWorkPage;
