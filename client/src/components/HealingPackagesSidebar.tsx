// admin-client/src/components/HealingPackagesSidebar.jsx
import React, { CSSProperties } from "react";
import { Typography, theme } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;
const { useToken } = theme;

interface Package {
  key: string;
  title: string;
  shortPreview: string;
}

interface HealingPackagesSidebarProps {
  packages: Package[];
  onPackageClick: (pkg: Package) => void;
  isMobile: boolean;
}

const HealingPackagesSidebar = ({ packages, onPackageClick, isMobile }: HealingPackagesSidebarProps) => {
  const { token } = useToken();

  if (!packages || packages.length === 0) {
    return null;
  }

  const buttonStyle: CSSProperties = {
    background: "var(--canvas-white)",
    border: "3px solid var(--border-subtle)",
    borderRadius: 0,
    padding: "24px 20px",
    color: "var(--border-subtle)",
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    maxWidth: "340px",
    display: "block",
    marginBottom: "20px",
    boxShadow: "6px 6px 0px var(--border-subtle)",
    position: "relative",
    transition: "transform 0.1s ease",
  };

  const handlePackageClick = (pkg: Package) => {
    if (onPackageClick) {
      onPackageClick(pkg);
    }
  };

  return (
    <div
      style={{
        padding: "40px 16px 16px 16px",
        overflowY: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "var(--bg-primary)",
        backgroundImage: `
          linear-gradient(135deg, var(--border-subtle) 25%, transparent 25%),
          linear-gradient(225deg, var(--border-subtle) 25%, transparent 25%),
          linear-gradient(315deg, var(--border-subtle) 25%, transparent 25%),
          linear-gradient(45deg, var(--border-subtle) 25%, transparent 25%)
        `,
        backgroundSize: '32px 32px',
        backgroundPosition: '16px 0, 16px 0, 0 0, 0 0',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Pattern Overlay to soften it and add African mudcloth character */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--bg-primary)',
        backgroundImage: `radial-gradient(var(--border-subtle) 1px, transparent 1px)`,
        backgroundSize: '16px 16px',
        opacity: 0.94,
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Content wrapper to stay above overlay */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header Section */}
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
          <ShoppingOutlined
            style={{
              color: "var(--canvas-white)",
              fontSize: "24px",
            }}
          />
        </div>
        <Title level={4} style={{ margin: 0, color: "var(--border-subtle)", fontFamily: "var(--font-primary)", fontWeight: 900, textTransform: 'uppercase', textAlign: 'center' }}>
          Healing Packages
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
          Select your journey
        </Text>
      </div>

      {/* Package Cards */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        {packages.map((pkg) => (
          <button
            key={pkg.key}
            onClick={() => handlePackageClick(pkg)}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "8px 8px 0px var(--border-subtle)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "6px 6px 0px var(--border-subtle)";
            }}
          >
            {/* Content */}
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
                {pkg.title}
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
                {pkg.shortPreview}
              </Text>
            </div>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
};

const Title = Typography.Title;

export default HealingPackagesSidebar;
