// src/pages/PilotDetailPage.jsx
import React, { useState, useEffect, useCallback, useMemo  } from 'react';
import { useParams, Link } from "react-router-dom";
import {
  Spin,
  Typography,
  Button,
  Tag,
  Card,
  Divider,
  Grid,
  Space,
  theme,
  Modal,
  Form,
  Input,
  message,
  Radio,
  List,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  TeamOutlined,
  BulbOutlined,
  SendOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;
const { TextArea } = Input;

const PilotDetailPage: React.FC = () => {
  const { pilotKey } = useParams();
  const [pilot, setPilot] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [engagementModalVisible, setEngagementModalVisible] = useState<boolean>(false);
  const [engagementLoading, setEngagementLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const { token } = useToken();
  const navigate = useNavigate();
  const [selectedEngagementType, setSelectedEngagementType] =
    useState<string>("partner");

  // Theme mode detection - memoized
  const { isDarkMode, mode } = useMemo(() => {
    const isDarkMode =
      token.colorBgBase === "#1a2332" || token.colorBgContainer === "#0f1621";
    return {
      isDarkMode,
      isLightMode: !isDarkMode,
      mode: isDarkMode ? "dark" : "light",
    };
  }, [token.colorBgBase, token.colorBgContainer]);

  // Engagement options - memoized
  const engagementOptions = useMemo(
    () => [
      {
        value: "partner",
        label: "Partnership",
        description: "Collaborate on this project as a partner",
        icon: <FaRegHandshake />,
        color: "#52c41a",
      },
      {
        value: "invest",
        label: "Investment",
        description: "Invest in this concept or project",
        icon: <FaMoneyBillTrendUp />,
        color: "#1890ff",
      },
      {
        value: "meeting",
        label: "Request Meeting",
        description: "Schedule a meeting to discuss further",
        icon: <TeamOutlined />,
        color: "#722ed1",
      },
      {
        value: "custom",
        label: "Other Intentions",
        description: "Describe your specific interests",
        icon: <BulbOutlined />,
        color: "#fa8c16",
      },
    ],
    []
  );

  // Fetch pilot detail - properly memoized
  const fetchPilotDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPilot(null);

    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/pilots/${pilotKey}`);
      setPilot(response.data);
    } catch (err) {
      console.error("Failed to fetch pilot details:", err);
      let errorMessage = "Could not load pilot project details.";
      if (err.response?.status === 404) {
        errorMessage = `Pilot project with key "${pilotKey}" not found.`;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pilotKey]);

  // Handle engagement form submission
  const handleEngagementSubmit = useCallback(
    async (values) => {
      setEngagementLoading(true);
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://api.qsi.africa/api";

        const payload = {
          pilotKey: pilotKey,
          pilotTitle: pilot?.title,
          engagementType: values.engagementType,
          customIntent: values.customIntent,
          message: values.message,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          timestamp: new Date().toISOString(),
        };

        await axios.post(`${baseURL}/submit/pilot-engagement`, payload);

        message.success(
          "Your engagement request has been submitted successfully! We'll contact you shortly."
        );
        setEngagementModalVisible(false);
        form.resetFields();
      } catch (error) {
        console.error("Engagement submission error:", error);
        message.error(
          "Failed to submit your request. Please try again or contact us directly."
        );
      } finally {
        setEngagementLoading(false);
      }
    },
    [pilotKey, pilot?.title, form]
  );

  const openEngagementModal = useCallback(() => {
    setEngagementModalVisible(true);
  }, []);

  const closeEngagementModal = useCallback(() => {
    setEngagementModalVisible(false);
    form.resetFields();
    setSelectedEngagementType("partner");
  }, [form]);

  // Handle engagement type change
  const handleEngagementTypeChange = useCallback(
    (optionValue) => {
      setSelectedEngagementType(optionValue);
      form.setFieldValue("engagementType", optionValue);
    },
    [form]
  );

  useEffect(() => {
    if (pilotKey) {
      fetchPilotDetail();
    }
  }, [fetchPilotDetail, pilotKey]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Responsive styles - memoized with dependencies
  const styles = useMemo(() => {
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;

    return {
      container: {
        minHeight: "100vh",
        background: token.colorBgLayout,
        padding: isMobile ? `${token.paddingSM}px` : `${token.paddingLG}px`,
      },
      navSection: {
        maxWidth: isMobile ? "95%" : isTablet ? "90%" : "80%",
        margin: `0 auto ${isMobile ? token.marginSM : token.margin}px`,
      },
      contentCard: {
        maxWidth: isMobile ? "95%" : isTablet ? "90%" : "80%",
        margin: "0 auto",
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        padding: isMobile ? `${token.padding}px` : `${token.paddingXL}px`,
        boxShadow: token.boxShadowSecondary,
        border: `1px solid ${token.colorBorder}`,
      },
      errorCard: {
        textAlign: "center",
        padding: isMobile
          ? `${token.paddingXL}px ${token.padding}px`
          : `${token.paddingXL * 2}px ${token.paddingXL}px`,
      },
      pilotMeta: {
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        gap: `${token.marginSM}px`,
        marginBottom: `${token.marginLG}px`,
      },
      dateInfo: {
        display: "flex",
        alignItems: "center",
        gap: `${token.paddingSM}px`,
        color: token.colorTextSecondary,
      },
      pilotTitle: {
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeightHeading1,
        marginBottom: `${token.margin}px`,
        background: `transparent`,
        color: token.colorSuccess,
        fontSize: isMobile
          ? token.fontSizeHeading3
          : isTablet
          ? token.fontSizeHeading2
          : token.fontSizeHeading1,
      },
      pilotSubtitle: {
        fontSize: isMobile ? token.fontSize : token.fontSizeHeading4,
        lineHeight: token.lineHeight,
        color: token.colorTextSecondary,
        marginBottom: 0,
      },
      pilotContent: {
        fontSize: isMobile ? token.fontSize : token.fontSizeLG,
        lineHeight: token.lineHeight,
        color: token.colorText,
      },
      contentHeadingH3: {
        color: token.colorText,
        fontSize: isMobile ? token.fontSizeHeading4 : token.fontSizeHeading3,
        margin: `${isMobile ? token.marginLG : token.marginXL}px 0 ${
          token.margin
        }px`,
        paddingBottom: `${token.paddingSM}px`,
        textDecoration: "underline",
        textDecorationColor: token.colorPrimary,
        textDecorationThickness: "2px",
        textUnderlineOffset: "4px",
        fontWeight: token.fontWeightStrong,
      },
      contentHeadingH4: {
        color: token.colorText,
        fontSize: isMobile ? token.fontSizeHeading5 : token.fontSizeHeading4,
        margin: `${isMobile ? token.margin : token.marginLG}px 0 ${
          token.marginSM
        }px`,
        fontWeight: token.fontWeightStrong,
      },
      contentParagraph: {
        marginBottom: `${token.marginLG}px`,
        lineHeight: token.lineHeight,
        color: token.colorText,
      },
      contentList: {
        marginBottom: `${token.marginLG}px`,
        paddingLeft: isMobile ? `${token.margin}px` : `${token.marginLG}px`,
      },
      contentListItem: {
        marginBottom: `${token.marginXS}px`,
        lineHeight: token.lineHeight,
      },
      contentStrong: {
        color: token.colorText,
        fontWeight: token.fontWeightStrong,
      },
      contentEmphasis: {
        color: token.colorTextSecondary,
        fontStyle: "italic",
      },
      contentBlockquote: {
        borderLeft: `4px solid ${token.colorPrimary}`,
        padding: isMobile ? `${token.padding}px` : `${token.paddingLG}px`,
        margin: `${isMobile ? token.margin : token.marginLG}px 0`,
        background: token.colorFillAlter || token.colorBgContainer,
        borderRadius: `0 ${token.borderRadius}px ${token.borderRadius}px 0`,
        fontStyle: "italic",
        border: `1px solid ${token.colorBorder}`,
      },
      contentCodeInline: {
        background: token.colorFillSecondary,
        padding: `2px ${token.paddingXS}px`,
        borderRadius: token.borderRadiusSM,
        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        fontSize: "0.85em",
        color: token.colorInfo,
      },
      contentCodeBlock: {
        background: token.colorFillSecondary,
        color: token.colorText,
        padding: isMobile ? `${token.padding}px` : `${token.paddingLG}px`,
        borderRadius: token.borderRadius,
        margin: `${token.margin}px 0`,
        overflowX: "auto",
        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        fontSize: "0.85em",
        lineHeight: 1.5,
        border: `1px solid ${token.colorBorder}`,
      },
      ctaCard: {
        border: "none",
        boxShadow: token.boxShadowTertiary,
        borderRadius: token.borderRadiusLG,
        textAlign: "center",
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorInfo} 100%)`,
      },
      ctaTitle: {
        color: `${token.colorTextLightSolid} !important`,
        marginBottom: `${token.margin}px`,
        fontSize: isMobile ? token.fontSizeHeading5 : token.fontSizeHeading4,
        fontWeight: token.fontWeightStrong,
      },
      ctaDescription: {
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: `${token.marginLG}px`,
        fontSize: isMobile ? token.fontSize : token.fontSizeLG,
        lineHeight: token.lineHeight,
      },
      ctaActions: {
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: `${token.marginSM}px`,
        justifyContent: "center",
        alignItems: "center",
      },
      loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        background: token.colorBgLayout,
      },
      errorTitle: {
        color: token.colorError,
        marginBottom: `${token.margin}px`,
        fontSize: isMobile ? token.fontSizeHeading3 : token.fontSizeHeading2,
        fontWeight: token.fontWeightStrong,
      },
      errorMessage: {
        color: token.colorTextSecondary,
        fontSize: isMobile ? token.fontSize : token.fontSizeLG,
        lineHeight: token.lineHeight,
      },
      tagStyle: {
        background: pilot?.isActive
          ? `${token.colorSuccessBg}`
          : token.colorFillSecondary,
        color: pilot?.isActive ? token.colorSuccess : token.colorTextSecondary,
        border: "none",
        fontWeight: token.fontWeightMedium,
        padding: "4px 12px",
        margin: 0,
        borderRadius: token.borderRadiusSM,
      },
      engagementOptionCard: {
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        padding: `0px`,
        marginBottom: `${token.marginSM}px`,
        cursor: "pointer",
        transition: "all 0.3s ease",
        background: token.colorBgContainer,
      },
      engagementOptionCardSelected: {
        border: `2px solid ${token.colorPrimary}`,
        background: token.colorPrimaryBg,
      },
      contactInfoCard: {
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        padding: `0px`,
      },
    };
  }, [screens, token, pilot?.isActive]);

  // Clean markdown function - memoized
  const cleanMarkdown = useCallback((text) => {
    if (!text) return "";

    return text
      .split("\n")
      .map((line) => {
        if (
          line.trim().startsWith("*") ||
          line.trim().startsWith("-") ||
          /^\d+\./.test(line.trim())
        ) {
          return line.trim();
        }
        return line.replace(/^\s+/, "");
      })
      .join("\n")
      .trim();
  }, []);

  // ReactMarkdown components - memoized
  const markdownComponents = useMemo(
    () => ({
      h3: (props) => (
        <Title level={3} style={styles.contentHeadingH3} {...props} />
      ),
      h4: (props) => (
        <Title level={4} style={styles.contentHeadingH4} {...props} />
      ),
      p: (props) => <Paragraph style={styles.contentParagraph} {...props} />,
      strong: (props) => (
        <Text strong style={styles.contentStrong} {...props} />
      ),
      em: (props) => <Text italic style={styles.contentEmphasis} {...props} />,
      ul: (props) => <ul style={styles.contentList} {...props} />,
      ol: (props) => <ol style={styles.contentList} {...props} />,
      li: (props) => <li style={styles.contentListItem} {...props} />,
      blockquote: (props) => (
        <blockquote style={styles.contentBlockquote} {...props} />
      ),
      code: ({ inline, ...props }) => {
        if (inline) {
          return <code style={styles.contentCodeInline} {...props} />;
        }
        return (
          <pre style={styles.contentCodeBlock}>
            <code {...props} />
          </pre>
        );
      },
    }),
    [styles]
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !pilot) {
    return (
      <div style={styles.container}>
        <div style={styles.navSection}>
          <Button
            icon={<ArrowLeftOutlined />}
            type="default"
            size={screens.xs ? "middle" : "large"}
            style={{
              borderColor: token.colorBorder,
              color: token.colorTextSecondary,
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
        <div style={{ ...styles.contentCard, ...styles.errorCard }}>
          <Title level={2} style={styles.errorTitle}>
            {error ? "Error Loading Concept" : "Concept Not Found"}
          </Title>
          <Paragraph style={styles.errorMessage}>
            {error || "Concept data could not be loaded."}
          </Paragraph>
          <Button
            type="primary"
            onClick={fetchPilotDetail}
            style={{
              marginTop: token.marginLG,
              background: token.colorPrimary,
              borderColor: token.colorPrimary,
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <div style={styles.navSection}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="link"
          size={screens.xs ? "middle" : "large"}
          style={{
            color: token.colorPrimary,
            fontWeight: token.fontWeightMedium,
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div style={styles.contentCard}>
        {/* Header */}
        <header style={{ marginBottom: `${token.marginXL}px` }}>
          <div style={styles.pilotMeta}>
            <Space
              direction={screens.xs ? "vertical" : "horizontal"}
              align={screens.xs ? "start" : "center"}
              size={screens.xs ? "small" : "middle"}
            >
              <Tag style={styles.tagStyle}>
                {pilot.isActive ? "Active" : "Inactive"}
              </Tag>
              <div style={styles.dateInfo}>
                <CalendarOutlined />
                <Text type="secondary">
                  Created {formatDate(pilot.createdAt)}
                </Text>
              </div>
              <Tag
                color={isDarkMode ? "blue" : "cyan"}
                style={{
                  fontSize: token.fontSizeSM,
                  fontWeight: token.fontWeightMedium,
                }}
              >
                {mode} mode
              </Tag>
            </Space>
          </div>

          <Title
            level={screens.xs ? 4 : screens.md ? 2 : 1}
            style={styles.pilotTitle}
          >
            {pilot.title}
          </Title>

          {pilot.shortDescription && (
            <Paragraph style={styles.pilotSubtitle}>
              {pilot.shortDescription}
            </Paragraph>
          )}
        </header>

        {/* Content */}
        <article style={styles.pilotContent}>
          <ReactMarkdown components={markdownComponents}>
            {cleanMarkdown(pilot.expandedView || pilot.shortDescription)}
          </ReactMarkdown>
        </article>

        {/* Footer */}
        <Divider style={{ borderColor: token.colorBorderSecondary }} />

        <footer style={{ marginTop: `${token.marginXL}px` }}>
          <Card style={styles.ctaCard}>
            <Title level={screens.xs ? 5 : 4} style={styles.ctaTitle}>
              Ready to{" "}
              {`${pilot?.type == "Concept" ? "Collaborate?" : "Implement?"}`}
            </Title>
            <Paragraph style={styles.ctaDescription}>
              {pilot?.type == "Concept"
                ? "Interested in partnering, investing, or learning more about this concept? Let us know your intentions and we'll get back to you."
                : "Interested in this framework, or learning more about it? Get in touch with Pan African Engineers to explore opportunities."}
            </Paragraph>
            <div style={styles.ctaActions}>
              <Button
                type="primary"
                size={screens.xs ? "middle" : "large"}
                onClick={openEngagementModal}
                icon={<MessageOutlined />}
                style={{
                  background: token.colorBgContainer,
                  color: token.colorPrimary,
                  border: `1px solid ${token.colorBgContainer}`,
                  fontWeight: token.fontWeightStrong,
                  height: screens.xs
                    ? token.controlHeight
                    : token.controlHeightLG,
                  padding: `0 ${
                    screens.xs ? token.padding : token.paddingLG
                  }px`,
                  minWidth: screens.xs ? "100%" : "auto",
                }}
              >
                Express Interest
              </Button>

              <Button
                type="default"
                size={screens.xs ? "middle" : "large"}
                onClick={() => navigate("/pilots")}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: token.colorTextLightSolid,
                  border: `1px solid rgba(255, 255, 255, 0.3)`,
                  height: screens.xs
                    ? token.controlHeight
                    : token.controlHeightLG,
                  padding: `0 ${
                    screens.xs ? token.padding : token.paddingLG
                  }px`,
                  minWidth: screens.xs ? "100%" : "auto",
                }}
              >
                View More Projects
              </Button>
            </div>
          </Card>
        </footer>
      </div>

      {/* Engagement Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageOutlined style={{ color: token.colorPrimary }} />
            <span>Express Interest in {pilot.title}</span>
          </div>
        }
        open={engagementModalVisible}
        onCancel={closeEngagementModal}
        footer={null}
        width={screens.xs ? "95%" : screens.md ? "70%" : "50%"}
        destroyOnClose
        style={{
          top: "10px",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEngagementSubmit}
          initialValues={{ engagementType: selectedEngagementType }}
        >
          {/* Engagement Type Selection */}
          <Form.Item
            name="engagementType"
            label="What is your primary intention?"
            rules={[
              { required: true, message: "Please select your intention" },
            ]}
          >
            <Radio.Group style={{ width: "100%" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {engagementOptions.map((option) => (
                  <Card
                    key={option.value}
                    style={{
                      ...styles.engagementOptionCard,
                      ...(selectedEngagementType === option.value
                        ? styles.engagementOptionCardSelected
                        : {}),
                    }}
                    onClick={() => handleEngagementTypeChange(option.value)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          color: option.color,
                          fontSize: "20px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {option.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text
                          strong
                          style={{ color: token.colorText, display: "block" }}
                        >
                          {option.label}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {option.description}
                        </Text>
                      </div>
                      <Radio value={option.value} />
                    </div>
                  </Card>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          {/* Custom Intent Field */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.engagementType !== currentValues.engagementType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("engagementType") === "custom" ? (
                <Form.Item
                  name="customIntent"
                  label="Please describe your intentions"
                  rules={[
                    {
                      required: true,
                      message: "Please describe your intentions",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Tell us what you'd like to do with this concept..."
                    rows={3}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {/* Contact Information */}
          <Divider>Your Contact Information</Divider>

          <Form.Item
            name="contactName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
            />
          </Form.Item>

          <Form.Item
            name="contactEmail"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your.email@example.com"
            />
          </Form.Item>

          <Form.Item name="contactPhone" label="Phone Number">
            <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" />
          </Form.Item>

          <Form.Item name="message" label="Additional Message (Optional)">
            <TextArea
              rows={4}
              placeholder="Any additional information you'd like to share..."
            />
          </Form.Item>

          {/* Contact Information Display */}
          <Card style={styles.contactInfoCard}>
            <Title level={5} style={{ marginBottom: token.margin }}>
              <TeamOutlined style={{ marginRight: "8px" }} />
              Quick Contact Options
            </Title>
            <List
              size="small"
              dataSource={[
                { icon: <PhoneOutlined />, text: "Call: +263 77 109 9675" },
                { icon: <MailOutlined />, text: "Email: info@qsi.com" },
                {
                  icon: <MessageOutlined />,
                  text: "WhatsApp: +263 77 109 9675",
                },
              ]}
              renderItem={(item) => (
                <List.Item style={{ border: "none", padding: "4px 0" }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        icon={item.icon}
                        style={{ background: token.colorPrimary }}
                      />
                    }
                    description={<Text type="secondary">{item.text}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
              marginTop: token.marginLG,
            }}
          >
            <Button onClick={closeEngagementModal}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={engagementLoading}
              icon={<SendOutlined />}
            >
              Submit Interest
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PilotDetailPage;
