// src/components/FrequencyScan.jsx
import React from "react";
import { Typography, Card, theme, Button } from "antd"; // Import Button
import { ExperimentOutlined, ArrowLeftOutlined } from "@ant-design/icons"; // Import ArrowLeftOutlined
import { Link } from "react-router-dom"; // Import Link

const { Title, Paragraph } = Typography;
const { useToken } = theme;

const FrequencyScan: React.FC = () => {
  const { token } = useToken();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 200px)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <ExperimentOutlined
          style={{
            fontSize: "48px",
            color: token.colorPrimary,
            marginBottom: "24px",
          }}
        />
        <Title level={3} style={{ color: token.colorText }}>
          Frequency Scan Coming Soon
        </Title>
        <Paragraph
          style={{ color: token.colorTextSecondary, fontSize: "16px" }}
        >
          The QSI Frequency Scan feature is currently under development and will
          be available soon.
        </Paragraph>
        <Paragraph style={{ color: token.colorTextSecondary }}>
          This new module will allow you to complete a detailed profile to
          analyze your vibrational tendencies and unlock deeper insights. Please
          check back later.
        </Paragraph>

        {/* --- Add the "Go Back Home" Button --- */}
        <Link to="/">
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            style={{ marginTop: "24px" }}
          >
            Go Back Home
          </Button>
        </Link>
        {/* ----------------------------------- */}
      </Card>
    </div>
  );
};

export default FrequencyScan;
