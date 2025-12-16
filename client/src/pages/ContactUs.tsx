import React, { useState  } from 'react';
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdLanguage,
  MdSend,
  MdChatBubbleOutline,
  MdAccessTime,
} from "react-icons/md";
import { theme } from "antd";

const { useToken } = theme;

const ContactUs: React.FC = () => {
  const { token } = useToken();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isHovered, setIsHovered] = useState<any>(null);

  const handleChange = (e: React.FormEvent) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Message sent! We will get back to you soon.");
  };

  const contactInfo = [
    {
      icon: <MdLocationOn size={24} />,
      title: "Visit Us",
      content: "No. 3 Jenkinson close, Chisipite, Harare",
      color: token.colorPrimary,
    },
    {
      icon: <MdPhone size={24} />,
      title: "Call Us",
      content: "+263 771 099 675 / +263 719 999 675",
      link: "tel:+263771099675",
      color: token.colorSuccess,
    },
    {
      icon: <MdEmail size={24} />,
      title: "Email Us",
      content: "info@hypercivilengineers.com",
      link: "mailto:info@hypercivilengineers.com",
      color: token.colorWarning,
    },
    {
      icon: <MdLanguage size={24} />,
      title: "Website",
      content: "www.hypercivilengineers.com",
      link: "http://www.hypercivilengineers.com",
      color: token.colorInfo,
    },
  ];

  // Inline styles using Ant Design tokens
  const styles = {
    container: {
      minHeight: "100vh",
      width: "100%",
      background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 50%, ${token.colorBgContainer} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    },
    animatedBg: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    },
    bgElement1: {
      position: "absolute",
      top: "25%",
      left: "25%",
      width: "384px",
      height: "384px",
      backgroundColor: `${token.colorPrimary}15`,
      borderRadius: "50%",
      filter: "blur(48px)",
      animation: "pulse 2s infinite",
    },
    bgElement2: {
      position: "absolute",
      bottom: "25%",
      right: "25%",
      width: "384px",
      height: "384px",
      backgroundColor: `${token.colorPrimary}15`,
      borderRadius: "50%",
      filter: "blur(48px)",
      animation: "pulse 2s infinite 1s",
    },
    mainContent: {
      position: "relative",
      width: "100%",
      maxWidth: "1280px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "32px",
    },
    leftSection: {
      display: "flex",
      flexDirection: "column",
      gap: "32px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      backgroundColor: `${token.colorPrimary}10`,
      borderRadius: "9999px",
      border: `1px solid ${token.colorPrimary}20`,
    },
    heading: {
      fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
      fontWeight: "bold",
      color: token.colorText,
      lineHeight: 1.2,
    },
    gradientText: {
      color: token.colorPrimary,
      // backgroundClip: "text",
      // WebkitBackgroundClip: "text",
      // WebkitTextFillColor: "transparent",
      display: "block",
    },
    subtitle: {
      fontSize: "1.125rem",
      color: token.colorTextSecondary,
    },
    contactGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
    },
    contactCard: {
      position: "relative",
      padding: "24px",
      backgroundColor: `${token.colorBgContainer}80`,
      backdropFilter: "blur(8px)",
      borderRadius: "16px",
      border: `1px solid ${token.colorBorder}80`,
      transition: "all 0.3s ease",
      cursor: "pointer",
      textDecoration: "none",
      display: "block",
    },
    contactCardHover: {
      transform: "scale(1.05)",
      borderColor: token.colorBorder,
    },
    iconContainer: (color) => ({
      display: "inline-flex",
      padding: "12px",
      borderRadius: "12px",
      background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
      marginBottom: "16px",
    }),
    cardTitle: {
      color: token.colorText,
      fontWeight: 600,
      marginBottom: "8px",
    },
    cardContent: {
      color: token.colorTextSecondary,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      wordBreak: "break-word",
    },
    infoBox: {
      padding: "24px",
      background: `linear-gradient(135deg, ${token.colorPrimary}10 0%, ${token.colorPrimaryActive}10 100%)`,
      borderRadius: "16px",
      border: `1px solid ${token.colorPrimary}20`,
    },
    infoTitle: {
      color: token.colorText,
      fontWeight: 600,
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    statusDot: {
      width: "8px",
      height: "8px",
      backgroundColor: token.colorSuccess,
      borderRadius: "50%",
      animation: "pulse 2s infinite",
    },
    infoText: {
      color: token.colorTextSecondary,
      fontSize: "0.875rem",
    },
    formContainer: {
      position: "sticky",
      top: "32px",
      height: "fit-content",
    },
    form: {
      padding: "32px",
      backgroundColor: `${token.colorBgContainer}80`,
      backdropFilter: "blur(8px)",
      borderRadius: "24px",
      border: `1px solid ${token.colorBorder}80`,
      boxShadow: token.boxShadowSecondary,
    },
    formTitle: {
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      fontWeight: "bold",
      color: token.colorText,
      marginBottom: "24px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      backgroundColor: `${token.colorBgContainer}80`,
      border: `1px solid ${token.colorBorder}`,
      borderRadius: "12px",
      color: token.colorText,
      fontSize: "1rem",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
    },
    inputFocus: {
      outline: "none",
      borderColor: token.colorPrimary,
      boxShadow: `0 0 0 2px ${token.colorPrimary}20`,
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: 500,
      color: token.colorTextTertiary,
      marginBottom: "8px",
    },
    textarea: {
      resize: "none",
      minHeight: "120px",
    },
    submitButton: {
      width: "100%",
      padding: "16px 24px",
      background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
      color: token.colorTextLightSolid,
      fontWeight: 600,
      borderRadius: "12px",
      border: "none",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: `0 4px 14px 0 ${token.colorPrimary}25`,
      cursor: "pointer",
      fontSize: "1rem",
      fontFamily: "inherit",
    },
    submitButtonHover: {
      background: `linear-gradient(135deg, ${token.colorPrimaryHover} 0%, ${token.colorPrimaryActive} 100%)`,
      transform: "translateY(-1px)",
      boxShadow: `0 6px 20px 0 ${token.colorPrimary}35`,
    },
  };

  // Add CSS animation for pulse
  React.useEffect(() => {
    const styleSheet = document.styleSheets[0];
    const keyframes = `
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }
    `;

    // Check if keyframes already exist
    if (!document.querySelector("style[data-pulse-animation]")) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-pulse-animation", "true");
      styleElement.textContent = keyframes;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.animatedBg}>
        <div style={styles.bgElement1}></div>
        <div style={styles.bgElement2}></div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.grid}>
          {/* Left Section - Contact Info */}
          <div style={styles.leftSection}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={styles.badge}>
                <MdChatBubbleOutline
                  size={16}
                  style={{ color: token.colorPrimary }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: token.colorPrimary,
                    fontWeight: 500,
                  }}
                >
                  Get In Touch
                </span>
              </div>
              <h1 style={styles.heading}>
                Let's Build
                <span style={styles.gradientText}>Something Great</span>
              </h1>
              <p style={styles.subtitle}>
                Connect with Hyper Engineers / QSI Platform. We're here to bring
                your vision to life.
              </p>
            </div>

            {/* Contact Cards */}
            <div style={styles.contactGrid}>
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.link || "#"}
                  target={
                    item.link && item.link.startsWith("http")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    item.link && item.link.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  style={{
                    ...styles.contactCard,
                    ...(isHovered === index && styles.contactCardHover),
                  }}
                  onMouseEnter={() => setIsHovered(index)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <div style={styles.iconContainer(item.color)}>
                    <div style={{ color: token.colorTextLightSolid }}>
                      {item.icon}
                    </div>
                  </div>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardContent}>{item.content}</p>
                </a>
              ))}
            </div>

            {/* Additional Info */}
            <div style={styles.infoBox}>
              <h3 style={styles.infoTitle}>
                <span style={styles.statusDot}></span>
                <MdAccessTime size={16} />
                Business Hours
              </h3>
              <p style={styles.infoText}>Monday - Friday: 8:00 AM - 5:00 PM</p>
              <p style={styles.infoText}>Saturday - Sunday: Closed</p>
            </div>
          </div>

          {/* Right Section - Contact Form */}
          <div style={styles.formContainer}>
            <div style={styles.form}>
              <h2 style={styles.formTitle}>Send us a message</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div>
                  <label style={styles.label}>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={styles.input}
                    onFocus={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorPrimary;
                      e.target.style.boxShadow = `0 0 0 2px ${token.colorPrimary}20`;
                    }}
                    onBlur={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    onFocus={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorPrimary;
                      e.target.style.boxShadow = `0 0 0 2px ${token.colorPrimary}20`;
                    }}
                    onBlur={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label style={styles.label}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={styles.input}
                    onFocus={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorPrimary;
                      e.target.style.boxShadow = `0 0 0 2px ${token.colorPrimary}20`;
                    }}
                    onBlur={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="Project Inquiry"
                  />
                </div>

                <div>
                  <label style={styles.label}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    style={{ ...styles.input, ...styles.textarea }}
                    onFocus={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorPrimary;
                      e.target.style.boxShadow = `0 0 0 2px ${token.colorPrimary}20`;
                    }}
                    onBlur={(e: React.FormEvent) => {
                      e.target.style.borderColor = token.colorBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>

                <button
                  onClick={handleSubmit}
                  style={styles.submitButton}
                  onMouseEnter={(e: React.FormEvent) => {
                    e.target.style.background = `linear-gradient(135deg, ${token.colorPrimaryHover} 0%, ${token.colorPrimaryActive} 100%)`;
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = `0 6px 20px 0 ${token.colorPrimary}35`;
                  }}
                  onMouseLeave={(e: React.FormEvent) => {
                    e.target.style.background = `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`;
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = `0 4px 14px 0 ${token.colorPrimary}25`;
                  }}
                >
                  <span>Send Message</span>
                  <MdSend
                    size={20}
                    style={{ transition: "transform 0.3s ease" }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
