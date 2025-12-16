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

  // Button Styles using tokens
  const buttonStyle = {
    background: token.colorFillTertiary,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    padding: `${token.paddingSM}px ${token.padding}px`,
    color: token.colorText,
    fontSize: token.fontSizeSM,
    textAlign: "left",
    cursor: "pointer",
    transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
    lineHeight: token.lineHeight,
    width: "250px",
    display: "block",
    marginBottom: token.marginSM,
    boxShadow: token.boxShadow,
    backdropFilter: "blur(8px)",
  };

  const buttonHoverEnter = (e: React.FormEvent) => {
    e.currentTarget.style.background = token.colorFillSecondary;
    e.currentTarget.style.borderColor = token.colorPrimaryHover;
    e.currentTarget.style.transform = "translateX(-4px) scale(1.03)";
    e.currentTarget.style.boxShadow = token.boxShadowSecondary;
  };

  const buttonHoverLeave = (e: React.FormEvent) => {
    e.currentTarget.style.background = token.colorFillTertiary;
    e.currentTarget.style.borderColor = token.colorBorder;
    e.currentTarget.style.transform = "translateX(0) scale(1)";
    e.currentTarget.style.boxShadow = token.boxShadow;
  };

  return (
    <div
      style={{
        padding: `${token.paddingLG}px ${token.paddingXXS}px ${token.paddingXXS}px ${token.paddingSM}px`,
        overflowY: "auto",
        height: "95%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: token.marginXS,
          marginBottom: token.margin,
          paddingLeft: token.padding,
        }}
      >
        <RocketOutlined
          style={{
            color: token.colorPrimary,
            fontSize: token.fontSizeLG,
          }}
        />
        <Paragraph
          style={{
            margin: 0,
            color: token.colorTextSecondary,
            fontSize: token.fontSizeSM,
            fontWeight: token.fontWeightMedium,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Explore Pilot Projects
        </Paragraph>
      </div>

      {/* Pilot List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {pilots.map((pilot) => (
          <Link
            key={pilot.key || pilot.id}
            to={`/pilots/${pilot.key}`}
            style={{
              ...buttonStyle,
              textDecoration: "none",
            }}
            onMouseEnter={buttonHoverEnter}
            onMouseLeave={buttonHoverLeave}
          >
            <Text
              style={{
                color: token.colorText,
                fontWeight: token.fontWeightMedium,
                fontSize: token.fontSizeSM,
                display: "block",
                marginBottom: token.marginXXS,
              }}
            >
              {pilot.title}
            </Text>
            <Text
              style={{
                color: token.colorTextSecondary,
                fontSize: token.fontSizeSM,
                display: "block",
                lineHeight: token.lineHeightSM,
              }}
            >
              {pilot.shortDescription}
            </Text>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PilotProjectsSidebar;
