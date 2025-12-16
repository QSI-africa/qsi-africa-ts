// src/pages/AboutUs.jsx
import React, { useState  } from 'react';
import {
  MdInfo,
  MdFlashOn,
  MdPublic,
  MdAutoAwesome,
  MdTrackChanges,
  MdWaves,
} from "react-icons/md";
import { theme, Typography } from "antd";
import { ToolOutlined, TeamOutlined, BulbOutlined } from "@ant-design/icons";

const { useToken } = theme;
const { Title, Paragraph } = Typography;

const AboutUs: React.FC = () => {
  const { token } = useToken();
  const [activeCard, setActiveCard] = useState<any>(null);

  // Core Areas based on QSI framework
  const coreAreas = [
    {
      icon: <TeamOutlined style={{ fontSize: "32px" }} />,
      title: "Consciousness & Culture",
      description:
        "Uniting human consciousness and culture into one continuous system of progress.",
      color: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorInfo} 100%)`,
      bgColor: `${token.colorPrimary}10`,
      borderColor: `${token.colorPrimary}20`,
    },
    {
      icon: <BulbOutlined style={{ fontSize: "32px" }} />,
      title: "Creation & Innovation",
      description:
        "Translating alignment into innovation, intention into infrastructure.",
      color: `linear-gradient(135deg, ${token.colorSuccess} 0%, ${token.colorWarning} 100%)`,
      bgColor: `${token.colorSuccess}10`,
      borderColor: `${token.colorSuccess}20`,
    },
    {
      icon: <ToolOutlined style={{ fontSize: "32px" }} />,
      title: "Coherence Framework",
      description:
        "A living intelligence framework for the African Renaissance.",
      color: `linear-gradient(135deg, ${token.colorError} 0%, ${token.colorPrimary} 100%)`,
      bgColor: `${token.colorError}10`,
      borderColor: `${token.colorError}20`,
    },
  ];

  // Scientific Principles from the document
  const principles = [
    {
      icon: <MdWaves size={24} />,
      title: "Quantum Entanglement",
      subtitle: "Einstein's 'spooky action at a distance'",
      description:
        "Communities, economies, and individuals are interconnected. A shift in one field ripples across the entire system.",
    },
    {
      icon: <MdTrackChanges size={24} />,
      title: "Resonance",
      description:
        "When Africans align in vision, gratitude, and coherence, their collective vibration multiplies, uplifting nations through shared frequency.",
    },
    {
      icon: <MdFlashOn size={24} />,
      title: "Least Action Principle",
      subtitle: "Euler-Lagrange",
      description:
        "Nature achieves transformation through the path of least resistance. Designing strategies that move with, not against, the natural flow of energy and intention.",
    },
  ];

  const styles = {
    container: {
      minHeight: "100vh",
      width: "100%",
      background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 50%, ${token.colorBgContainer} 100%)`,
      overflow: "hidden",
      position: "relative",
    },
    animatedBg: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    },
    bgElement1: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "384px",
      height: "384px",
      backgroundColor: `${token.colorPrimary}15`,
      borderRadius: "50%",
      filter: "blur(48px)",
      animation: "pulse 2s infinite",
    },
    bgElement2: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "384px",
      height: "384px",
      backgroundColor: `${token.colorPrimary}15`,
      borderRadius: "50%",
      filter: "blur(48px)",
      animation: "pulse 2s infinite 1.5s",
    },
    heroSection: {
      padding: "64px 16px 48px",
      position: "relative",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      backgroundColor: `${token.colorPrimary}10`,
      borderRadius: "9999px",
      border: `1px solid ${token.colorPrimary}20`,
      marginBottom: "16px",
    },
    heading: {
      fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
      fontWeight: "bold",
      color: token.colorText,
      lineHeight: 1.2,
      textAlign: "center",
      marginBottom: "24px",
    },
    gradientText: {
      color: ` ${token.colorPrimaryActive}`,
      display: "block",
    },
    heroText: {
      fontSize: "1.125rem",
      color: token.colorTextSecondary,
      lineHeight: 1.6,
      maxWidth: "672px",
      margin: "0 auto 16px",
    },
    secondaryText: {
      fontSize: "1rem",
      color: token.colorTextTertiary,
      maxWidth: "672px",
      margin: "0 auto",
    },
    qsiSection: {
      padding: "48px 16px",
      position: "relative",
    },
    qsiCard: {
      position: "relative",
      padding: "48px",
      background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
      backdropFilter: "blur(16px)",
      borderRadius: "24px",
      border: `1px solid ${token.colorBorder}80`,
      boxShadow: token.boxShadowSecondary,
      overflow: "hidden",
      maxWidth: "1152px",
      margin: "0 auto",
    },
    qsiGradient: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "256px",
      height: "256px",
      background: `linear-gradient(135deg, ${token.colorPrimary}20 0%, ${token.colorPrimaryActive}20 100%)`,
      borderRadius: "50%",
      filter: "blur(48px)",
    },
    qsiContent: {
      position: "relative",
      display: "flex",
      alignItems: "flex-start",
      gap: "24px",
    },
    qsiIcon: {
      flexShrink: 0,
      padding: "16px",
      background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
      borderRadius: "16px",
    },
    qsiTitle: {
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: "bold",
      color: token.colorText,
      marginBottom: "12px",
    },
    qsiDescription: {
      fontSize: "1.125rem",
      color: token.colorTextSecondary,
      lineHeight: 1.6,
    },
    coreAreasSection: {
      padding: "48px 16px",
      position: "relative",
    },
    coreAreasGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "32px",
      maxWidth: "1152px",
      margin: "0 auto",
    },
    coreAreaCard: {
      position: "relative",
      padding: "32px",
      background: `${token.colorBgContainer}`,
      backdropFilter: "blur(8px)",
      borderRadius: "24px",
      border: `1px solid ${token.colorBorder}`,
      transition: "all 0.5s ease",
      cursor: "pointer",
    },
    coreAreaCardHover: {
      borderColor: token.colorBorder,
      transform: "translateY(-4px)",
    },
    coreAreaIcon: {
      position: "relative",
      display: "inline-flex",
      padding: "16px",
      borderRadius: "16px",
      marginBottom: "24px",
      transition: "transform 0.5s ease",
    },
    coreAreaIconHover: {
      transform: "scale(1.1)",
    },
    coreAreaTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: token.colorText,
      marginBottom: "12px",
      transition: "all 0.3s ease",
    },
    coreAreaTitleHover: {
      background: `linear-gradient(135deg, ${token.colorText} 0%, ${token.colorTextSecondary} 100%)`,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    coreAreaDescription: {
      color: token.colorTextSecondary,
      lineHeight: 1.6,
      fontSize: "1rem",
    },
    principlesSection: {
      padding: "48px 16px",
      position: "relative",
    },
    sectionHeader: {
      textAlign: "center",
      marginBottom: "48px",
    },
    sectionTitle: {
      fontSize: "clamp(2rem, 4vw, 2.5rem)",
      fontWeight: "bold",
      color: token.colorText,
      marginBottom: "16px",
    },
    divider: {
      width: "80px",
      height: "2px",
      background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
      borderRadius: "1px",
      margin: "0 auto",
    },
    principlesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "32px",
      maxWidth: "1152px",
      margin: "0 auto",
    },
    principleCard: {
      padding: "32px",
      background: `${token.colorBgContainer}`,
      backdropFilter: "blur(8px)",
      borderRadius: "20px",
      border: `1px solid ${token.colorBorder}`,
      transition: "all 0.3s ease",
      textAlign: "center",
    },
    principleCardHover: {
      borderColor: `${token.colorBorder}50`,
      transform: "translateY(-4px)",
    },
    principleIcon: {
      display: "inline-flex",
      padding: "16px",
      background: `linear-gradient(135deg, ${token.colorPrimary}20 0%, ${token.colorPrimaryActive}20 100%)`,
      borderRadius: "16px",
      marginBottom: "20px",
    },
    principleTitle: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: token.colorText,
      marginBottom: "8px",
    },
    principleSubtitle: {
      fontSize: "0.875rem",
      color: token.colorTextTertiary,
      fontStyle: "italic",
      marginBottom: "12px",
    },
    principleDescription: {
      fontSize: "0.95rem",
      color: token.colorTextSecondary,
      lineHeight: 1.6,
    },
    missionSection: {
      padding: "48px 16px 80px",
      position: "relative",
    },
    missionCard: {
      position: "relative",
      padding: "48px",
      background: `linear-gradient(135deg, ${token.colorPrimary}10 0%, ${token.colorPrimaryActive}10 50%, ${token.colorSuccess}10 100%)`,
      backdropFilter: "blur(8px)",
      borderRadius: "24px",
      border: `1px solid ${token.colorPrimary}20`,
      overflow: "hidden",
      maxWidth: "896px",
      margin: "0 auto",
    },
    missionGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `linear-gradient(135deg, ${token.colorPrimary}5 0%, ${token.colorPrimaryActive}5 100%)`,
    },
    missionContent: {
      position: "relative",
      textAlign: "center",
    },
    missionHeader: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "16px",
    },
    missionTitle: {
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: "bold",
      color: token.colorText,
    },
    missionText: {
      fontSize: "1.125rem",
      color: token.colorTextSecondary,
      lineHeight: 1.6,
      maxWidth: "672px",
      margin: "0 auto",
    },
    highlight: {
      fontWeight: 600,
      color: token.colorText,
    },
  };

  // Add CSS animation for pulse
  React.useEffect(() => {
    if (!document.querySelector("style[data-pulse-animation]")) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-pulse-animation", "true");
      styleElement.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={{ position: "relative" }}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <div style={styles.badge}>
              <MdInfo size={16} style={{ color: token.colorPrimary }} />
              <span
                style={{
                  fontSize: "0.875rem",
                  color: token.colorPrimary,
                  fontWeight: 500,
                }}
              >
                Quantum Spiritual Intelligence
              </span>
            </div>

            <h1 style={styles.heading}>
              A Living Intelligence Framework
              <span style={styles.gradientText}>
                for the African Renaissance
              </span>
            </h1>

            <div style={{ maxWidth: "672px", margin: "0 auto" }}>
              <p style={styles.heroText}>
                QSI is a field of coherence that unites human consciousness,
                culture, and creation into one continuous system of progress.
              </p>
              <p style={styles.secondaryText}>
                It views nations not as problems to be solved but as frequencies
                to be tuned. When people, systems, and environments align,
                transformation flows naturally.
              </p>
            </div>
          </div>
        </div>

        {/* QSI Definition Section */}
        <div style={styles.qsiSection}>
          <div style={styles.qsiCard}>
            <div style={styles.qsiGradient}></div>

            <div style={styles.qsiContent}>
              <div style={styles.qsiIcon}>
                <MdAutoAwesome
                  size={32}
                  style={{ color: token.colorTextLightSolid }}
                />
              </div>
              <div>
                <h2 style={styles.qsiTitle}>The QSI Architecture</h2>
                <p style={styles.qsiDescription}>
                  QSI exists within an unseen architecture — translating
                  alignment into innovation, intention into infrastructure, and
                  consciousness into progress. It is a return to the natural
                  order of creation, where every idea, structure, and life form
                  vibrates in harmony with purpose.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Areas Grid */}
        <div style={styles.coreAreasSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>The QSI Framework</h2>
            <div style={styles.divider}></div>
          </div>
          <div style={styles.coreAreasGrid}>
            {coreAreas.map((area, index) => (
              <div
                key={index}
                style={{
                  ...styles.coreAreaCard,
                  ...(activeCard === index && styles.coreAreaCardHover),
                  borderColor: area.borderColor,
                }}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div
                  style={{
                    ...styles.coreAreaIcon,
                    background: area.color,
                    ...(activeCard === index && styles.coreAreaIconHover),
                  }}
                >
                  <div
                    style={{
                      color: token.colorTextLightSolid,
                      fontSize: "32px",
                    }}
                  >
                    {area.icon}
                  </div>
                </div>
                <div>
                  <h3
                    style={{
                      ...styles.coreAreaTitle,
                      ...(activeCard === index && styles.coreAreaTitleHover),
                    }}
                  >
                    {area.title}
                  </h3>
                  <p style={styles.coreAreaDescription}>{area.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scientific Principles Section */}
        <div style={styles.principlesSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Scientific Foundations</h2>
            <div style={styles.divider}></div>
          </div>

          <div style={styles.principlesGrid}>
            {principles.map((principle, index) => (
              <div
                key={index}
                style={styles.principleCard}
                onMouseEnter={(e: React.FormEvent) => {
                  e.currentTarget.style.borderColor = `${token.colorBorder}50`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e: React.FormEvent) => {
                  e.currentTarget.style.borderColor = `${token.colorBorder}30`;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={styles.principleIcon}>
                  <div style={{ color: token.colorPrimary, fontSize: "24px" }}>
                    {principle.icon}
                  </div>
                </div>
                <h3 style={styles.principleTitle}>{principle.title}</h3>
                {principle.subtitle && (
                  <p style={styles.principleSubtitle}>{principle.subtitle}</p>
                )}
                <p style={styles.principleDescription}>
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div style={styles.missionSection}>
          <div style={styles.missionCard}>
            <div style={styles.missionGradient}></div>

            <div style={styles.missionContent}>
              <div style={styles.missionHeader}>
                <MdPublic size={24} style={{ color: token.colorPrimary }} />
                <h2 style={styles.missionTitle}>Our Guiding Principle</h2>
                <MdPublic
                  size={24}
                  style={{ color: token.colorPrimaryActive }}
                />
              </div>
              <p style={styles.missionText}>
                <span style={styles.highlight}>
                  "When coherence leads, everything aligns."
                </span>
                <br />A return to the natural order of creation, where every
                idea, structure, and life form vibrates in harmony with purpose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
