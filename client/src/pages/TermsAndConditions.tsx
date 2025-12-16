// src/pages/TermsAndConditions.jsx
import React, { useState  } from 'react';
import {
  MdSecurity,
  MdDescription,
  MdBusiness,
  MdGavel,
  MdContactSupport,
  MdUpdate,
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

const TermsAndConditions: React.FC = () => {
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

  // Terms sections data
  const termsSections = [
    {
      key: "acceptance",
      title: "1. Acceptance of Terms",
      icon: <FileTextOutlined />,
      content: `By creating an account, submitting information, or participating in any QSI process (including Frequency Scan, Healing & Therapy, Smart Infrastructure, Vision Space, or related frameworks and concepts), you confirm that you have read, understood, and agreed to these Terms. If you do not agree, please discontinue use of the QSI platform immediately.`
    },
    {
      key: "nature",
      title: "2. Nature of the Platform",
      icon: <FaShieldAlt />,
      content: `QSI is a human–system alignment framework integrating consciousness, culture, and design. Its tools and reports are intended to provide guidance, insight, and coherence-based optimization for individuals, organizations, and projects. QSI does not offer medical, financial, or legal advice, and any personal or professional decisions made based on QSI recommendations remain the sole responsibility of the user.`
    },
    {
      key: "privacy",
      title: "3. Data Privacy and Confidentiality",
      icon: <FaShieldAlt />,
      content: `All information submitted to QSI (including personal, emotional, or professional data) is treated as confidential. QSI will not sell, rent, or disclose user data to third parties without explicit consent, except where required by law. Data is stored securely in encrypted environments and used only for coherence analysis, personalized feedback, and system improvement. By using QSI, you consent to data processing as described in the Privacy Policy.`
    },
    {
      key: "frequency",
      title: "4. Frequency Scans and Reports",
      icon: <MdDescription size={20} />,
      content: `The Frequency Scan is an introspective tool designed to evaluate coherence across emotional, cognitive, and energetic dimensions. Reports and scores represent interpretive guidance based on submitted information. They are not diagnostic instruments and should be used as reflective frameworks for personal and professional development.`
    },
    {
      key: "healing",
      title: "5. Healing & Therapy Programs",
      icon: <TeamOutlined />,
      content: `Healing & Therapy modules are designed to support mental, emotional, and energetic balance. They complement — not replace — professional healthcare or therapy. Users are encouraged to consult licensed professionals for any medical or psychological concerns.`
    },
    {
      key: "projects",
      title: "6. Project and Vision Submissions",
      icon: <MdBusiness size={20} />,
      content: `When users submit project or vision details to QSI (via Smart Infrastructure or Vision Space), they agree that QSI may review and evaluate the submission for coherence and alignment. Intellectual property of the submission remains with the user unless a partnership agreement is formally signed. QSI reserves the right to reject, refine, or propose modifications to submitted ideas to maintain systemic coherence.`
    },
    {
      key: "partnerships",
      title: "7. Partnerships and QSI-Powered Concepts",
      icon: <TeamOutlined />,
      content: `Participation in QSI-powered frameworks or concepts (e.g., Heritage Flame, SolarFlame, FutureCraft Cooperative) is subject to separate partnership or licensing agreements. Adoption, co-ownership, or investment in QSI concepts requires formal written approval and adherence to QSI's coherence and ethical standards.`
    },
    {
      key: "ip",
      title: "8. Intellectual Property",
      icon: <MdSecurity size={20} />,
      content: `All QSI materials — including text, graphics, algorithms, coherence models, frameworks, and branding — are protected under applicable copyright and intellectual property laws. Reproduction, redistribution, or modification without written consent from QSI or its authorized entities is strictly prohibited.`
    },
    {
      key: "responsibility",
      title: "9. User Responsibility",
      icon: <MdGavel size={20} />,
      content: `Users agree to provide accurate and truthful information, use the QSI platform for lawful and constructive purposes, avoid uploading or transmitting harmful, offensive, or misleading content, and accept that QSI reserves the right to suspend or terminate access for any misuse or breach of coherence ethics.`
    },
    {
      key: "liability",
      title: "10. Limitation of Liability",
      icon: <MdGavel size={20} />,
      content: `QSI and its partners shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use its services. All engagement with QSI tools, reports, and frameworks is voluntary and undertaken at the user's own discretion.`
    },
    {
      key: "updates",
      title: "11. Updates and Modifications",
      icon: <MdUpdate size={20} />,
      content: `QSI reserves the right to modify these Terms at any time to reflect system updates, legal requirements, or operational changes. Continued use of the platform after updates constitutes acceptance of the revised Terms.`
    },
    {
      key: "governing",
      title: "12. Governing Law",
      icon: <GlobalOutlined />,
      content: `These Terms are governed by the laws of the Republic of Zimbabwe and applicable international frameworks on digital ethics and data protection. Any disputes arising under these Terms shall be resolved through good-faith negotiation or mediation before any formal proceedings.`
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
            <MdSecurity size={16} style={{ color: token.colorText }} />
            <span style={{ fontSize: "0.875rem", color: token.colorText, fontWeight: 500 }}>
              Legal Framework
            </span>
          </div>

          <h1 style={styles.mainTitle}>
            QSI <span style={styles.gradientText}>Terms & Conditions</span>
          </h1>
          
          <p style={styles.subtitle}>
            Welcome to QSI — a coherence-based digital environment dedicated to aligning 
            human intention, innovation, and development into a unified field of progress.
          </p>
        </div>

        {/* Terms and Conditions Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <FileTextOutlined />
              Terms and Conditions
            </h2>
            <p style={styles.cardSubtitle}>
              By accessing or using any QSI interface, product, or service, you agree to be bound by these Terms and Conditions.
            </p>
          </div>
          
          <div style={styles.cardContent}>
            <Collapse 
              ghost
              onChange={(key) => setActiveSection(key)}
              style={{ background: 'transparent' }}
            >
              {termsSections.map((section) => (
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
              For questions, clarifications, or partnership inquiries:<br />
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
            By continuing, you acknowledge that QSI is a field of coherence — and that your 
            participation contributes to the collective alignment of human, cultural, and 
            infrastructural evolution.
          </p>
          <p style={{ 
            color: token.colorPrimary, 
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginTop: '16px'
          }}>
            When coherence leads, everything aligns.
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

export default TermsAndConditions;