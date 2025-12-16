// admin-client/src/components/HealingPackagesSidebar.jsx
import React from "react";
import { Typography, theme, Input } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;
const { useToken } = theme;
const { TextArea } = Input;
const HealingPackagesSidebar = ({ packages, onPackageClick, isMobile }) => {
  const { token } = useToken();

  if (!packages || packages.length === 0) {
    return null;
  }

  const buttonStyle = {
    background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorFillTertiary} 100%)`,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadiusLG,
    padding: `${token.paddingLG}px ${token.padding}px`,
    color: token.colorText,
    fontSize: token.fontSize,
    textAlign: "left",
    cursor: "pointer",
    transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
    lineHeight: token.lineHeight,
    width: "100%",
    maxWidth: "320px",
    display: "block",
    marginBottom: token.margin,
    boxShadow: token.boxShadow,
    backdropFilter: "blur(10px)",
    position: "relative",
    overflow: "hidden",
  };

  const buttonHoverEnter = (e: React.FormEvent) => {
    e.currentTarget.style.background = `linear-gradient(135deg, ${token.colorPrimaryBgHover} 0%, ${token.colorFillSecondary} 100%)`;
    e.currentTarget.style.borderColor = token.colorPrimaryHover;
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = token.boxShadowSecondary;
  };

  const buttonHoverLeave = (e: React.FormEvent) => {
    e.currentTarget.style.background = `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorFillTertiary} 100%)`;
    e.currentTarget.style.borderColor = token.colorBorder;
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = token.boxShadow;
  };

  const handlePackageClick = (pkg) => {
    // Call the parent's onPackageClick function instead of opening own modal
    if (onPackageClick) {
      onPackageClick(pkg);
    }
  };

  return (
    <div
      style={{
        padding: `${token.paddingLG}px ${token.paddingXS}px ${token.paddingXS}px ${token.paddingSM}px`,
        overflowY: "auto",
        height: isMobile ? "auto" : "95%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: token.marginSM,
          marginBottom: token.marginLG,
          paddingLeft: token.paddingXXS,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorPrimaryBg}dd)`,
            borderRadius: token.borderRadius,
            padding: token.paddingSM,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${token.colorPrimaryBorder}`,
          }}
        >
          <ShoppingOutlined
            style={{
              color: token.colorPrimary,
              fontSize: token.fontSizeLG,
            }}
          />
        </div>
        <div>
          <Paragraph
            style={{
              margin: 0,
              color: token.colorText,
              fontSize: token.fontSizeLG,
              fontWeight: token.fontWeightStrong,
              letterSpacing: "0.5px",
            }}
          >
            Healing Packages
          </Paragraph>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
              opacity: 0.8,
            }}
          >
            Select a package to get started
          </Text>
        </div>
      </div>

      {/* Package Cards */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {packages.map((pkg) => (
          <button
            key={pkg.key}
            onClick={() => handlePackageClick(pkg)}
            style={buttonStyle}
            onMouseEnter={buttonHoverEnter}
            onMouseLeave={buttonHoverLeave}
          >
            {/* Accent Line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: "100%",
                background: `linear-gradient(180deg, ${token.colorPrimary}, transparent)`,
                borderRadius: `${token.borderRadiusLG}px 0 0 ${token.borderRadiusLG}px`,
              }}
            />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: token.marginXS,
                }}
              >
                <Text
                  style={{
                    color: token.colorText,
                    fontWeight: token.fontWeightStrong,
                    fontSize: token.fontSize,
                    lineHeight: token.lineHeightHeading4,
                    flex: 1,
                  }}
                >
                  {pkg.title}
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: token.marginXS,
                }}
              >
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeSM,
                    lineHeight: token.lineHeight,
                    flex: 1,
                  }}
                >
                  {pkg.shortPreview}
                </Text>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HealingPackagesSidebar;
