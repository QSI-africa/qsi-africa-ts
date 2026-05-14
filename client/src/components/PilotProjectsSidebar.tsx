// src/components/PilotProjectsSidebar.jsx
import React from "react";
import { Typography, theme } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Paragraph, Text } = Typography;
const { useToken } = theme;

const PilotProjectsSidebar = ({ pilots }) => {
  const { token } = useToken();

  if (!pilots || pilots.length === 0) {
    return null;
  }

  const linkStyle = {
    background: "var(--canvas-white)",
    border: "3px solid var(--border-subtle)",
    borderRadius: 0,
    padding: "20px",
    color: "var(--border-subtle)",
    textDecoration: "none",
    width: "100%",
    maxWidth: "340px",
    display: "block",
    marginBottom: "20px",
    boxShadow: "6px 6px 0px var(--border-subtle)",
    position: "relative",
    transition: "transform 0.1s ease",
  };

  return (
    <div
      style={{
        padding: "16px",
        overflowY: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          marginBottom: "40px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "var(--savanna-moss)",
            border: "3px solid var(--border-subtle)",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px",
          }}
        >
          <RocketOutlined
            style={{
              color: "var(--canvas-white)",
              fontSize: "24px",
            }}
          />
        </div>
        <Title level={4} style={{ margin: 0, color: "var(--border-subtle)", fontFamily: "var(--font-primary)", fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>
          Explore Projects
        </Title>
        <Text
          style={{
            color: "var(--border-subtle)",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "var(--font-primary)",
            textTransform: "uppercase",
            opacity: 0.7,
            letterSpacing: "0.1em",
          }}
        >
          Visionary Pilots
        </Text>
      </div>

      {/* Pilot List */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        {pilots.map((pilot) => (
          <Link
            key={pilot.key || pilot.id}
            to={`/pilots/${pilot.key}`}
            style={linkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "8px 8px 0px var(--border-subtle)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "6px 6px 0px var(--border-subtle)";
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Text
                style={{
                  color: "var(--border-subtle)",
                  fontWeight: 900,
                  fontSize: "14px",
                  fontFamily: "var(--font-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {pilot.title}
              </Text>
              <Text
                style={{
                  color: "var(--border-subtle)",
                  fontSize: "12px",
                  fontFamily: "var(--font-primary)",
                  lineHeight: 1.4,
                  opacity: 0.8,
                }}
              >
                {pilot.shortDescription}
              </Text>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Title = Typography.Title;

export default PilotProjectsSidebar;
