// src/pages/SmartCityDemoDetail.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
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
  EnvironmentOutlined
} from "@ant-design/icons";
import axios from "axios";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const { useToken } = theme;
const { TextArea } = Input;

const SmartCityDemoDetail: React.FC = () => {
  const { id } = useParams(); // Using ID from URL
  const [demo, setDemo] = useState<any>(null);
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

  // Engagement options - tailored for Demos
  const engagementOptions = useMemo(
    () => [
      {
        value: "invest",
        label: "I am interested in investing",
        description: "Explore investment opportunities in this demonstrator",
        icon: <FaMoneyBillTrendUp />,
        color: "#1890ff",
      },
      {
        value: "participate",
        label: "I want to participate",
        description: "Engage as a participant or resident",
        icon: <TeamOutlined />,
        color: "#52c41a",
      },
      {
        value: "learn",
        label: "I want to learn more",
        description: "Request more information about this system",
        icon: <BulbOutlined />,
        color: "#fa8c16",
      },
      {
        value: "collaborate",
        label: "I want to collaborate",
        description: "Offer technical or strategic collaboration",
        icon: <FaRegHandshake />,
        color: "#722ed1",
      },
    ],
    []
  );

  // Fetch demo detail
  const fetchDemoDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDemo(null);

    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.qsi.africa/api";
      // Update endpoint to /submit/demos/:id
      const response = await axios.get(`${baseURL}/submit/demos/${id}`);
      setDemo(response.data);
    } catch (err: any) {
      console.error("Failed to fetch demo details:", err);
      let errorMessage = "Could not load demonstrator details.";
      if (err.response?.status === 404) {
        errorMessage = `Demonstrator not found.`;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Handle engagement form submission
  const handleEngagementSubmit = useCallback(
    async (values: any) => {
      setEngagementLoading(true);
      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ||
          "https://api.qsi.africa/api";

        const payload = {
          pilotKey: id, // Sending ID as key
          pilotTitle: demo?.name, // Use name as title
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
          "Your engagement request has been submitted successfully!"
        );
        setEngagementModalVisible(false);
        form.resetFields();
      } catch (error) {
        console.error("Engagement submission error:", error);
        message.error(
          "Failed to submit your request."
        );
      } finally {
        setEngagementLoading(false);
      }
    },
    [id, demo?.name, form]
  );

  const openEngagementModal = useCallback(() => {
    setEngagementModalVisible(true);
  }, []);

  const closeEngagementModal = useCallback(() => {
    setEngagementModalVisible(false);
    form.resetFields();
    setSelectedEngagementType("invest");
  }, [form]);

  // Handle engagement type change
  const handleEngagementTypeChange = useCallback(
    (optionValue: string) => {
      setSelectedEngagementType(optionValue);
      form.setFieldValue("engagementType", optionValue);
    },
    [form]
  );

  useEffect(() => {
    if (id) {
      fetchDemoDetail();
    }
  }, [fetchDemoDetail, id]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Simplified styles
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
        background: demo?.isActive
          ? `${token.colorSuccessBg}`
          : token.colorFillSecondary,
        color: demo?.isActive ? token.colorSuccess : token.colorTextSecondary,
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
        borderRadius: token.borderRadius,
      },
      engagementOptionCardSelected: {
        border: `2px solid ${token.colorPrimary}`,
        background: token.colorPrimaryBg,
      },
      contactInfoCard: {
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        padding: `12px`,
      },
    };
  }, [screens, token, demo?.isActive]);

  const cleanMarkdown = useCallback((text: string) => {
    if (!text) return "";
    return text;
  }, []);

  const markdownComponents = useMemo(
    () => ({
      h3: (props: any) => (
        <Title level={3} style={styles.contentHeadingH3} {...props} />
      ),
      h4: (props: any) => (
        <Title level={4} style={styles.contentHeadingH4} {...props} />
      ),
      p: (props: any) => <Paragraph style={styles.contentParagraph} {...props} />,
// ... (Shortened for brevity, use same components)
      code: ({ inline, ...props }: any) => {
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

  if (error || !demo) {
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
            onClick={() => navigate("/demos")}
          >
            Back to Smart City Demos
          </Button>
        </div>
        <div style={{ ...styles.contentCard, ...styles.errorCard }}>
          <Title level={2} style={styles.errorTitle}>
            {error ? "Error Loading Demonstrator" : "Demonstrator Not Found"}
          </Title>
          <Paragraph style={styles.errorMessage}>
            {error || "Demonstrator data could not be loaded."}
          </Paragraph>
          <Button type="primary" onClick={fetchDemoDetail}>Try Again</Button>
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
          onClick={() => navigate("/demos")}
        >
          Back to Smart City Demos
        </Button>
      </div>

      {/* Main Content */}
      <div style={styles.contentCard}>
        {/* Header */}
        <header style={{ marginBottom: `${token.marginXL}px` }}>
          <div style={styles.pilotMeta}>
            <Space size="middle">
              <Tag style={styles.tagStyle}>{demo.status || "PROPOSED"}</Tag>
              {demo.city && (
                <div style={styles.dateInfo}>
                  <EnvironmentOutlined />
                  <Text type="secondary">{demo.city}</Text>
                </div>
              )}
            </Space>
          </div>

          <Title
            level={screens.xs ? 4 : screens.md ? 2 : 1}
            style={styles.pilotTitle}
          >
            {demo.name}
          </Title>

          {demo.shortDescription && (
            <Paragraph style={styles.pilotSubtitle}>
              {demo.shortDescription}
            </Paragraph>
          )}
        </header>

        {/* Content */}
        <article style={styles.pilotContent}>
          <ReactMarkdown components={markdownComponents}>
             {/* Uses fullDescription from schema */}
            {cleanMarkdown(demo.fullDescription || demo.shortDescription)}
          </ReactMarkdown>
        </article>

        {/* Footer */}
        <Divider style={{ borderColor: token.colorBorderSecondary }} />

        {demo.engagementEnabled && (
        <footer style={{ marginTop: `${token.marginXL}px` }}>
          <Card style={styles.ctaCard}>
            <Title level={screens.xs ? 5 : 4} style={styles.ctaTitle}>
              Engage with this Demonstrator
            </Title>
            <div style={styles.ctaActions}>
              <Button
                type="primary"
                size={screens.xs ? "middle" : "large"}
                onClick={openEngagementModal}
                icon={<MessageOutlined />}
                style={{
                  height: screens.xs ? token.controlHeight : token.controlHeightLG,
                  padding: `0 ${screens.xs ? token.padding : token.paddingLG}px`,
                }}
              >
                I am interested
              </Button>
            </div>
          </Card>
        </footer>
        )}
      </div>

      {/* Engagement Modal */}
      <Modal
        title={`Engage with ${demo.name}`}
        open={engagementModalVisible}
        onCancel={closeEngagementModal}
        footer={null}
        width={screens.xs ? "95%" : screens.md ? "70%" : "50%"}
        destroyOnClose
        style={{ top: "10px" }}
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
            label="What is your primary interest?"
            rules={[
              { required: true, message: "Please select your interest" },
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
                    <div style={{ display: "flex", gap: "12px", padding: "12px" }}>
                       <div style={{ color: option.color, fontSize: "20px" }}>{option.icon}</div>
                       <div>
                         <Text strong>{option.label}</Text><br/>
                         <Text type="secondary" style={{fontSize:"12px"}}>{option.description}</Text>
                       </div>
                    </div>
                  </Card>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider>Contact Details</Divider>
          <Form.Item name="contactName" label="Name" rules={[{ required: true }]}>
             <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="contactEmail" label="Email" rules={[{ required: true, type: 'email' }]}>
             <Input prefix={<MailOutlined />} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button onClick={closeEngagementModal}>Cancel</Button>
             <Button type="primary" htmlType="submit" loading={engagementLoading}>Submit</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SmartCityDemoDetail;
