// admin-client/src/pages/ClientDetailPage.jsx
import React, { useState, useEffect, useCallback  } from 'react';
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Typography,
  App as AntApp,
  Spin,
  Card,
  Descriptions,
  Divider,
  Tag,
  theme,
  Grid,
  Table,
  Space,
  Collapse,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import api from "../api";
import ReactMarkdown from "react-markdown";
const { useToken } = theme;

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const { Panel } = Collapse;

const ClientDetailPage: React.FC = () => {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { message } = AntApp.useApp();
  const { token } = useToken();
  const screens = useBreakpoint();

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/clients/${id}`);
      setClient(response.data);
    } catch (error) {
      console.error("Failed to fetch client:", error);
      if (error.response?.status !== 401) {
        message.error(
          error.response?.data?.error || "Failed to load client details."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id, message]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  // Enhanced markdown cleaning and formatting
  const formatMarkdown = (text) => {
    if (!text) return "";

    // Clean up common markdown formatting issues
    return text
      .replace(/\*\*(.*?)\*\*/g, "**$1**") // Ensure bold markers
      .replace(/\*(.*?)\*/g, "*$1*") // Ensure italic markers
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive newlines
      .replace(/^# (.*$)/gim, "# $1") // Ensure header formatting
      .replace(/^## (.*$)/gim, "## $1")
      .replace(/^### (.*$)/gim, "### $1")
      .trim();
  };

  // Custom markdown components with better styling
  const markdownComponents = {
    h1: ({ children }) => (
      <Title
        level={2}
        style={{
          color: token.colorPrimary,
          marginTop: token.marginLG,
          marginBottom: token.margin,
          borderBottom: `2px solid ${token.colorPrimaryBorder}`,
          paddingBottom: token.paddingXS,
        }}
      >
        {children}
      </Title>
    ),
    h2: ({ children }) => (
      <Title
        level={3}
        style={{
          color: token.colorTextHeading,
          marginTop: token.marginLG,
          marginBottom: token.marginSM,
        }}
      >
        {children}
      </Title>
    ),
    h3: ({ children }) => (
      <Title
        level={4}
        style={{
          color: token.colorText,
          marginTop: token.margin,
          marginBottom: token.marginXS,
        }}
      >
        {children}
      </Title>
    ),
    h4: ({ children }) => (
      <Title
        level={5}
        style={{
          color: token.colorTextSecondary,
          marginTop: token.margin,
          marginBottom: token.marginXS,
        }}
      >
        {children}
      </Title>
    ),
    p: ({ children }) => (
      <Paragraph
        style={{
          marginBottom: token.margin,
          lineHeight: 1.6,
          color: token.colorText,
        }}
      >
        {children}
      </Paragraph>
    ),
    strong: ({ children }) => (
      <Text strong style={{ color: token.colorText }}>
        {children}
      </Text>
    ),
    em: ({ children }) => (
      <Text italic style={{ color: token.colorTextSecondary }}>
        {children}
      </Text>
    ),
    ul: ({ children }) => (
      <ul
        style={{
          marginBottom: token.marginLG,
          paddingLeft: token.marginLG,
          color: token.colorText,
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          marginBottom: token.marginLG,
          paddingLeft: token.marginLG,
          color: token.colorText,
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li
        style={{
          marginBottom: token.marginXS,
          lineHeight: 1.6,
        }}
      >
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: `4px solid ${token.colorPrimary}`,
          padding: `${token.padding}px ${token.paddingLG}px`,
          margin: `${token.margin}px 0`,
          background: token.colorFillAlter,
          borderRadius: `0 ${token.borderRadius}px ${token.borderRadius}px 0`,
          fontStyle: "italic",
          color: token.colorText,
        }}
      >
        {children}
      </blockquote>
    ),
    code: ({ inline, children, className }) => {
      if (inline) {
        return (
          <code
            style={{
              background: token.colorFillSecondary,
              padding: `2px ${token.paddingXS}px`,
              borderRadius: token.borderRadiusSM,
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              fontSize: "0.85em",
              color: token.colorError,
            }}
          >
            {children}
          </code>
        );
      }
      return (
        <pre
          style={{
            background: token.colorFillSecondary,
            padding: token.padding,
            borderRadius: token.borderRadius,
            margin: `${token.margin}px 0`,
            overflowX: "auto",
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            fontSize: "0.85em",
            lineHeight: 1.5,
            border: `1px solid ${token.colorBorder}`,
          }}
        >
          <code>{children}</code>
        </pre>
      );
    },
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!client) {
    return (
      <Card>
        <Title level={3}>Client not found</Title>
        <Paragraph>The requested client could not be found.</Paragraph>
        <Link to="/clients">
          <Button type="primary">Back to Clients</Button>
        </Link>
      </Card>
    );
  }

  const profile = client.frequencyProfile;
  const isMobile = !screens.md;

  return (
    <div style={{ padding: isMobile ? token.padding : token.paddingLG }}>
      {/* Header Navigation */}
      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: token.marginLG }}
      >
        <Link to="/clients">
          <Button icon={<ArrowLeftOutlined />} type="text">
            Back to All Clients
          </Button>
        </Link>

        <Card>
          <Space size="large" wrap>
            <Space>
              <UserOutlined
                style={{ color: token.colorPrimary, fontSize: "24px" }}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {client.name}
                </Title>
                <Text type="secondary">{client.email}</Text>
              </div>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">
                Joined: {new Date(client.createdAt).toLocaleDateString()}
              </Text>
            </Space>
          </Space>
        </Card>
      </Space>

      {/* Frequency Profile Section */}
      <Card
        title={
          <Space>
            <BulbOutlined />
            <span>Frequency Profile</span>
          </Space>
        }
        style={{ marginBottom: token.marginLG }}
        extra={
          profile ? (
            <Tag color="green">Profile Completed</Tag>
          ) : (
            <Tag color="orange">No Profile</Tag>
          )
        }
      >
        {profile ? (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Basic Information */}
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
              size="small"
            >
              {profile.location && (
                <Descriptions.Item label="Location" span={1}>
                  <Space>
                    <EnvironmentOutlined />
                    {profile.location}
                  </Space>
                </Descriptions.Item>
              )}
              {profile.personalBeliefs && (
                <Descriptions.Item label="Personal Beliefs" span={2}>
                  {profile.personalBeliefs}
                </Descriptions.Item>
              )}
              {profile.background && (
                <Descriptions.Item label="Background" span={3}>
                  {profile.background}
                </Descriptions.Item>
              )}
              {profile.lifeVision && (
                <Descriptions.Item label="Life Vision" span={3}>
                  {profile.lifeVision}
                </Descriptions.Item>
              )}
              {profile.challenges && (
                <Descriptions.Item label="Challenges" span={3}>
                  {profile.challenges}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* AI Analysis */}
            <Divider>AI Frequency Scan Analysis</Divider>
            <Card
              type="inner"
              style={{
                background: token.colorFillAlter,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              {profile.generatedProfile ? (
                <ReactMarkdown components={markdownComponents}>
                  {formatMarkdown(profile.generatedProfile)}
                </ReactMarkdown>
              ) : (
                <Text type="secondary">No AI analysis available.</Text>
              )}
            </Card>
          </Space>
        ) : (
          <div style={{ textAlign: "center", padding: token.paddingXL }}>
            <UserOutlined
              style={{
                fontSize: "48px",
                color: token.colorTextDisabled,
                marginBottom: token.margin,
              }}
            />
            <Paragraph type="secondary">
              This user has not completed their Frequency Scan onboarding.
            </Paragraph>
          </div>
        )}
      </Card>

      {/* Healing Inquiries Section */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Healing Inquiries</span>
            {client.healingSubmissions?.length > 0 && (
              <Tag color="blue">{client.healingSubmissions.length}</Tag>
            )}
          </Space>
        }
      >
        {client.healingSubmissions?.length > 0 ? (
          <Collapse ghost>
            {client.healingSubmissions.map((submission, index) => (
              <Panel
                key={submission.id}
                header={
                  <Space>
                    <Text strong>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </Text>
                    <Text type="secondary">
                      {submission.struggleDescription.substring(0, 80)}...
                    </Text>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>Inquiry Details:</Text>
                  <Card size="small">
                    <Paragraph>{submission.struggleDescription}</Paragraph>
                  </Card>

                  {submission.generatedPlan && (
                    <>
                      <Text strong>AI Response:</Text>
                      <Card
                        size="small"
                        style={{
                          background: token.colorFillAlter,
                          border: `1px solid ${token.colorPrimaryBorder}`,
                        }}
                      >
                        <ReactMarkdown components={markdownComponents}>
                          {formatMarkdown(submission.generatedPlan)}
                        </ReactMarkdown>
                      </Card>
                    </>
                  )}
                </Space>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div style={{ textAlign: "center", padding: token.paddingXL }}>
            <HistoryOutlined
              style={{
                fontSize: "48px",
                color: token.colorTextDisabled,
                marginBottom: token.margin,
              }}
            />
            <Paragraph type="secondary">No healing inquiries yet.</Paragraph>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClientDetailPage;
