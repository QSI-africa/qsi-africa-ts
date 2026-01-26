// src/pages/SmartCityDemosPage.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Button, theme } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: React.FormEvent) => {
      // @ts-ignore
      setMousePosition({
        // @ts-ignore
        x: (e.clientX / window.innerWidth) * 100,
        // @ts-ignore
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    // @ts-ignore
    window.addEventListener("mousemove", handleMouseMove);
    // @ts-ignore
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch demos on component mount
  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://api.qsi.africa/api";

        // Call new endpoint for demos
        const response = await axios.get(
          `${baseURL}/submit/demos`
        );

        if (Array.isArray(response.data)) {
          setFrameworks(response.data);
        } else {
          console.error(
            "Fetched demo data is not an array:",
            response.data
          );
          setError("Received invalid data format for demonstrators.");
          setFrameworks([]);
        }
      } catch (err) {
        console.error("Failed to fetch demonstrators:", err);
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
          QSI Smart City Demos
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
          Where the future is lived, not imagined
        </Title>
        <Paragraph
          style={{
            textAlign: "center",
            marginBottom: "20px",
            padding: "10px 20px",
          }}
          type="secondary"
        >
          These are real or proposed physical Smart City demonstrators.
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

        {/* Demo Cards Grid */}
        {!loading && !error && (
          <Row
            gutter={[12, 12]}
            style={{
              marginBottom: "30px",
            }}
          >
            {frameworks.length > 0 ? (
              frameworks.map((demo) => (
                <Col key={demo.id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    onClick={() => handleCardClick(demo.id)}
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
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <Title level={5} style={{ marginBottom: "8px" }}>
                           <LuFrame
                             style={{
                               marginRight: "8px",
                               color: token.colorPrimary,
                             }}
                           />
                           {demo.name}
                         </Title>
                         {/* Status Icon could go here */}
                      </div>
                      
                      {demo.city && <Text type="secondary" style={{display:'block', marginBottom: 8}}>{demo.city}</Text>}
                      {demo.status && (
                        <Text style={{ fontSize: '12px', color: demo.status === 'ACTIVE' ? 'green' : 'orange' }}>
                          {demo.status === 'ACTIVE' ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {demo.status}
                        </Text>
                      )}

                      <Paragraph
                        type="secondary"
                        style={{
                          fontSize: "14px",
                          flexGrow: 1,
                          marginTop: "16px",
                          marginBottom: "16px",
                        }}
                        ellipsis={{ rows: 3 }}
                      >
                        {demo.shortDescription}
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
                  No demonstrators found.
                </Text>
              </Col>
            )}
          </Row>
        )}
      </div>
    </div>
  );
};

export default SmartCityDemosPage;
