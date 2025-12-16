// src/pages/Privacy.jsx
import React, { useState  } from 'react';
import {
  MdPrivacyTip,
  MdSecurity,
  MdDataUsage,
  MdCookie,
  MdChildCare,
  MdContactSupport,
} from "react-icons/md";
import { theme, Typography, Collapse } from "antd";
import { 
  FileTextOutlined, 
  GlobalOutlined,
  MailOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { FaShieldAlt } from "react-icons/fa";

const { useToken } = theme;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Privacy: React.FC = () => {
  const { token } = useToken();
  const [activeSection, setActiveSection] = useState<any>(null);

  const styles = {
    container: {
      minHeight: "100vh",
      width: "100%",
      background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 50%, ${token.colorBgContainer} 100%)`,
      overflow: "hidden",
      position: "relative",
      padding: "64px 16px 48px",
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
      backgroundColor: `${token.colorPrimary}40`,
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
      backgroundColor: `${token.colorPrimary}30`,
      borderRadius: "50%",
      filter: "blur(48px)",
      animation: "pulse 2s infinite 1.5s",
    },
    contentContainer: {
      maxWidth: "900px",
      margin: "0 auto",
      position: "relative",
    },
    headerSection: {
      textAlign: "center",
      marginBottom: "48px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      backgroundColor: `${token.colorPrimary}`,
      borderRadius: "9999px",
      border: `1px solid ${token.colorPrimary}`,
      marginBottom: "16px",
    },
    mainTitle: {
      fontSize: "clamp(2rem, 5vw, 3.5rem)",
      fontWeight: "bold",
      color: token.colorText,
      lineHeight: 1.2,
      marginBottom: "16px",
    },
    gradientText: {
      color: `${token.colorPrimary}`,
    },
    subtitle: {
      fontSize: "1.125rem",
      color: token.colorTextSecondary,
      lineHeight: 1.6,
      maxWidth: "600px",
      margin: "0 auto",
    },
    card: {
      background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`,
      backdropFilter: "blur(16px)",
      borderRadius: "24px",
      border: `1px solid ${token.colorBorder}`,
      boxShadow: token.boxShadowSecondary,
      overflow: "hidden",
      marginBottom: "32px",
    },
    cardHeader: {
      padding: "32px 32px 16px",
      borderBottom: `1px solid ${token.colorBorder}`,
    },
    cardTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: token.colorText,
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    cardSubtitle: {
      fontSize: "1rem",
      color: token.colorTextSecondary,
    },
    cardContent: {
      padding: "24px 32px 32px",
    },
    sectionTitle: {
      fontSize: "1.25rem",
      fontWeight: 600,
      color: token.colorText,
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    sectionContent: {
      color: token.colorTextSecondary,
      lineHeight: 1.7,
      fontSize: "1rem",
    },
    contactSection: {
      textAlign: "center",
      padding: "48px 32px",
      background: `linear-gradient(135deg, ${token.colorPrimary}10 0%, ${token.colorPrimaryActive}10 100%)`,
      borderRadius: "24px",
      border: `1px solid ${token.colorPrimary}10`,
      marginTop: "48px",
    },
    contactTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: token.colorText,
      marginBottom: "16px",
    },
    contactInfo: {
      fontSize: "1.125rem",
      color: token.colorTextSecondary,
      lineHeight: 1.6,
    },
    emailLink: {
      color: token.colorPrimary,
      fontWeight: 600,
      textDecoration: "none",
      '&:hover': {
        textDecoration: 'underline',
      }
    }
  };

  // Privacy Policy sections data
  const privacySections = [
    {
      key: "information",
      title: "1. Information We Collect",
      icon: <MdDataUsage size={20} />,
      content: `QSI values your privacy, integrity, and energetic safety. This policy explains how we collect, store, and use your information to provide a coherent and secure user experience across all QSI interfaces and frameworks. By using QSI services or submitting personal information through our digital platforms, you consent to the practices described below.`
    },
    {
      key: "personal",
      title: "2. Personal Information",
      icon: <MdDataUsage size={20} />,
      content: `When you engage with QSI — for example, through the Frequency Scan, Healing & Therapy, Smart Infrastructure, or Vision Space modules — we may collect: Full name and contact details (email, phone number, location), personal beliefs and worldviews (for coherence mapping), educational and professional background, descriptions of life goals, visions, and challenges, uploaded files, project submissions, or correspondence.`
    },
    {
      key: "technical",
      title: "3. Technical Information",
      icon: <MdDataUsage size={20} />,
      content: `We may automatically collect limited technical data to improve functionality and user experience: Device type and browser information, IP address and session activity, anonymous analytics to measure engagement and performance. Users may upload documents (e.g., project reports or images) to support assessments or submissions. These are processed securely and used only for coherence analysis or project evaluation.`
    },
    {
      key: "usage",
      title: "4. How We Use Your Information",
      icon: <MdDataUsage size={20} />,
      content: `QSI processes your information to: Generate your Frequency Scan Report and coherence profile, provide personalized healing or alignment recommendations, evaluate project or vision submissions, communicate updates, feedback, or partnership opportunities, improve platform performance and service delivery. All insights and recommendations are generated using ethical data modeling that respects user confidentiality and free will.`
    },
    {
      key: "security",
      title: "5. Data Security",
      icon: <MdSecurity size={20} />,
      content: `QSI uses encryption and secure servers to store all information safely. Data is protected against unauthorized access, alteration, or disclosure through multi-layered security protocols. Sensitive content such as Frequency Scans and healing reports is encrypted both in storage and during transmission.`
    },
    {
      key: "confidentiality",
      title: "6. Confidentiality",
      icon: <FaShieldAlt />,
      content: `Your personal data and Frequency Reports are strictly confidential. They will never be sold, traded, or shared with third parties for advertising or unrelated purposes. Information may only be shared with your explicit written consent, with trusted service providers performing QSI-related operations under confidentiality agreements, or when legally required by a court order or regulatory body.`
    },
    {
      key: "retention",
      title: "7. Data Retention",
      icon: <FileTextOutlined />,
      content: `Frequency Scan data is stored for as long as your account remains active or as required to maintain coherence analytics. Project and vision submissions are retained for evaluation and historical system learning unless you request deletion. You may request that your data be deleted, anonymized, or exported at any time by contacting us directly.`
    },
    {
      key: "rights",
      title: "8. Your Rights",
      icon: <TeamOutlined />,
      content: `You have the right to: Access and review your data, request corrections or updates, withdraw consent or request deletion ("Right to be Forgotten"), receive a copy of your Frequency Report and related data. Requests are honored promptly, in accordance with international data protection standards.`
    },
    {
      key: "cookies",
      title: "9. Cookies and Analytics",
      icon: <MdCookie size={20} />,
      content: `QSI uses minimal, non-invasive cookies to improve system performance and remember user preferences. Analytics tools may collect anonymous interaction data for continuous improvement. No behavioral tracking or third-party advertising cookies are used.`
    },
    {
      key: "minors",
      title: "10. Minors",
      icon: <MdChildCare size={20} />,
      content: `QSI services are intended for individuals aged 18 and above. Users under 18 must have verifiable guardian consent before submitting personal information.`
    },
    {
      key: "updates",
      title: "11. Updates to This Policy",
      icon: <GlobalOutlined />,
      content: `This Privacy Policy may be updated periodically to reflect new features or legal requirements. Any significant change will be announced through our platform before taking effect.`
    }
  ];

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.animatedBg}>
        <div style={styles.bgElement1}></div>
        <div style={styles.bgElement2}></div>
      </div>

      <div style={styles.contentContainer}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <div style={styles.badge}>
            <MdPrivacyTip size={16} style={{ color: token.colorText }} />
            <span style={{ fontSize: "0.875rem", color: token.colorText, fontWeight: 500 }}>
              Data Protection
            </span>
          </div>

          <h1 style={styles.mainTitle}>
            QSI <span style={styles.gradientText}>Privacy Policy</span>
          </h1>
          
          <p style={styles.subtitle}>
            QSI values your privacy, integrity, and energetic safety. This policy explains how we collect, 
            store, and use your information to provide a coherent and secure user experience.
          </p>
        </div>

        {/* Privacy Policy Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <MdPrivacyTip size={24} />
              Privacy Policy
            </h2>
            <p style={styles.cardSubtitle}>
              By using QSI services or submitting personal information through our digital platforms, 
              you consent to the practices described below.
            </p>
          </div>
          
          <div style={styles.cardContent}>
            <Collapse 
              ghost
              onChange={(key) => setActiveSection(key)}
              style={{ background: 'transparent' }}
            >
              {privacySections.map((section) => (
                <Panel 
                  key={section.key}
                  header={
                    <div style={styles.sectionTitle}>
                      {section.icon}
                      {section.title}
                    </div>
                  }
                  style={{ 
                    border: 'none',
                    background: 'transparent',
                    marginBottom: '16px',
                  }}
                >
                  <div style={styles.sectionContent}>
                    {section.content}
                  </div>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>

        {/* Contact Section */}
        <div style={styles.contactSection}>
          <h3 style={styles.contactTitle}>Contact Information</h3>
          <div style={styles.contactInfo}>
            <p>
              <strong>PAN AFRICAN ENGINEERS</strong><br />
              No. 3 Jenkingson Close, Chisipite, Harare<br />
              +263 771 099 675 / +263 719 999 675
            </p>
            <p>
              For privacy requests, data removal, or clarifications:<br />
              <a 
                href="mailto:info@qsi.co.zw" 
                style={styles.emailLink}
              >
                <MailOutlined /> info@qsi.co.zw
              </a>
            </p>
          </div>
        </div>

        {/* Final Statement */}
        <div style={{ textAlign: 'center', marginTop: '48px', padding: '24px' }}>
          <p style={{ 
            color: token.colorTextSecondary, 
            fontSize: '1rem',
            fontStyle: 'italic'
          }}>
            QSI exists to protect not only your data but your energetic integrity. Your information 
            remains part of a coherent field — used only to elevate awareness, innovation, and alignment 
            across the systems we build together.
          </p>
          <p style={{ 
            color: token.colorPrimary, 
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginTop: '16px'
          }}>
            Coherence begins with trust.
          </p>
          <p style={{ 
            color: token.colorTextTertiary, 
            fontSize: '0.875rem',
            marginTop: '16px'
          }}>
            © www.qsi.co.zw
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;