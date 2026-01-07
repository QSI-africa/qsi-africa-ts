// admin-client/src/pages/VisionSubmissionsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Typography,
  App as AntApp,
  Button,
  Modal,
  theme,
  Card,
  Space,
  Tag,
  Grid,
  Divider,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import api from "../api";
import ReactMarkdown from "react-markdown";

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const VisionSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const { message } = AntApp.useApp();
  const { token } = useToken();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/vision-submissions");
      console.log("API Response:", response.data);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Failed to fetch vision submissions:", error);
      if (error.response?.status !== 401) {
        message.error(
          error.response?.data?.error || "Failed to load vision submissions."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const showDetails = (submission) => {
    setSelectedSubmission(submission);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedSubmission(null);
  };

  const formatContactInfo = (contactInfo) => {
    if (!contactInfo) return "Not provided";
    if (contactInfo.includes("@")) return contactInfo;
    if (contactInfo.replace(/\D/g, "").length >= 10) return contactInfo;
    return contactInfo;
  };

  const getContactType = (contactInfo) => {
    if (!contactInfo) return "unknown";
    if (contactInfo.includes("@")) return "email";
    if (contactInfo.replace(/\D/g, "").length >= 10) return "phone";
    return "other";
  };

  const contactTypeColors = {
    email: token.colorInfo,
    phone: token.colorSuccess,
    other: token.colorWarning,
    unknown: token.colorTextTertiary,
  };

  const columns = [
    {
      title: "Contact Info",
      dataIndex: "contactInfo",
      key: "contactInfo",
      render: (contactInfo) => (
        <Space>
          <UserOutlined style={{ color: token.colorTextTertiary }} />
          <Text
            style={{
              color: token.colorText,
              fontWeight: 500,
            }}
          >
            {formatContactInfo(contactInfo)}
          </Text>
          <Tag
            color={contactTypeColors[getContactType(contactInfo)]}
            style={{
              borderRadius: token.borderRadiusSM,
              fontSize: token.fontSizeSM,
              border: "none",
              margin: 0,
            }}
          >
            {getContactType(contactInfo)}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Submitted On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: token.colorTextTertiary }} />
          <Text style={{ color: token.colorTextSecondary }}>
            {new Date(text).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Initial Prompt",
      dataIndex: "initialPrompt",
      key: "initialPrompt",
      render: (text) => (
        <Text
          style={{
            color: token.colorTextSecondary,
            fontStyle: text ? "normal" : "italic",
          }}
        >
          {text
            ? text.substring(0, 80) + (text.length > 80 ? "..." : "")
            : "No prompt provided"}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showDetails(record)}
          style={{
            background: token.colorPrimaryBg,
            border: `1px solid ${token.colorPrimaryBorder}`,
            color: token.colorPrimaryText,
            borderRadius: token.borderRadius,
            fontWeight: 500,
          }}
        >
          View Vision Board
        </Button>
      ),
    },
  ];

  // Calculate stats
  const totalSubmissions = submissions.length;
  const todaySubmissions = submissions.filter((sub) => {
    const today = new Date();
    const subDate = new Date(sub.createdAt);
    return subDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Enhanced Background Elements */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          opacity: 0.4,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorPrimary}10 0%, transparent 70%)`,
            filter: "blur(40px)",
            top: "10%",
            left: "5%",
            animation: "float1 20s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorInfo}08 0%, transparent 70%)`,
            filter: "blur(40px)",
            bottom: "15%",
            right: "10%",
            animation: "float2 18s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: isMobile ? token.padding : token.paddingLG,
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: token.marginLG }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: token.margin,
              marginBottom: token.margin,
            }}
          >
            <div>
              <Title
                level={4}
                style={{
                  color: token.colorTextHeading,
                  marginBottom: token.marginXS,
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Vision Submissions
              </Title>
              <Paragraph
                style={{
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeLG,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Review user vision board submissions and AI-generated concepts
              </Paragraph>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSubmissions}
              loading={loading}
              style={{
                background: token.colorPrimaryBg,
                border: `1px solid ${token.colorPrimaryBorder}`,
                color: token.colorPrimaryText,
                borderRadius: token.borderRadius,
                fontWeight: 500,
              }}
            >
              Refresh
            </Button>
          </div>

          {/* Stats Summary */}
          <div style={{ marginBottom: token.marginLG }}>
            <Space
              size="large"
              wrap
              style={{
                background: token.colorBgContainer,
                padding: token.padding,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: token.boxShadowSecondary,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <BulbOutlined
                  style={{
                    color: token.colorPrimary,
                    fontSize: "20px",
                    marginBottom: token.marginXS,
                    display: "block",
                  }}
                />
                <Text
                  style={{
                    color: token.colorTextTertiary,
                    fontSize: token.fontSizeSM,
                    display: "block",
                  }}
                >
                  Total Submissions
                </Text>
                <Text
                  style={{
                    color: token.colorPrimary,
                    fontSize: "24px",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  {totalSubmissions}
                </Text>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    background: token.colorInfo,
                    borderRadius: "50%",
                    margin: `0 auto ${token.marginXS}px`,
                  }}
                />
                <Text
                  style={{
                    color: token.colorTextTertiary,
                    fontSize: token.fontSizeSM,
                    display: "block",
                  }}
                >
                  Today
                </Text>
                <Text
                  style={{
                    color: token.colorInfo,
                    fontSize: "24px",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  {todaySubmissions}
                </Text>
              </div>
            </Space>
          </div>
        </div>

        {/* Submissions Table */}
        <Card
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 12 }}
        >
          <Table
            columns={columns}
            dataSource={submissions}
            loading={loading}
            rowKey="id"
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} submissions`,
            }}
            scroll={isMobile ? { x: 800 } : {}}
          />
        </Card>
      </div>

      {/* Vision Board Modal */}
      <Modal
        title={
          <div>
            <Title
              level={4}
              style={{ color: token.colorTextHeading, margin: 0 }}
            >
              Generated Vision Board
            </Title>
            <Text
              style={{
                color: token.colorTextSecondary,
                fontSize: token.fontSizeSM,
              }}
            >
              Complete vision concept and details
            </Text>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button
            key="close"
            onClick={handleCloseModal}
            style={{
              background: token.colorPrimaryBg,
              border: `1px solid ${token.colorPrimaryBorder}`,
              color: token.colorPrimaryText,
              borderRadius: token.borderRadius,
              fontWeight: 500,
            }}
          >
            Close
          </Button>,
        ]}
        width={isMobile ? "90vw" : 800}
        styles={{
          body: {
            background: token.colorBgContainer,
            color: token.colorText,
            maxHeight: "70vh",
            overflowY: "auto",
          },
          header: {
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorder}`,
          },
          content: {
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          },
        }}
      >
        {selectedSubmission && (
          <div>
            {/* Contact Information */}
            <Card
              size="small"
              style={{
                background: token.colorFillTertiary,
                border: `1px solid ${token.colorBorder}`,
                marginBottom: token.margin,
              }}
              bodyStyle={{ padding: token.paddingSM }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Space>
                  <UserOutlined style={{ color: token.colorTextTertiary }} />
                  <Text strong style={{ color: token.colorText }}>
                    Contact Information:
                  </Text>
                </Space>
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    marginLeft: "24px",
                  }}
                >
                  {selectedSubmission.contactInfo || "Not provided"}
                </Text>
              </Space>
            </Card>

            {/* Submission Date */}
            <Card
              size="small"
              style={{
                background: token.colorFillTertiary,
                border: `1px solid ${token.colorBorder}`,
                marginBottom: token.margin,
              }}
              bodyStyle={{ padding: token.paddingSM }}
            >
              <Space>
                <CalendarOutlined style={{ color: token.colorTextTertiary }} />
                <Text strong style={{ color: token.colorText }}>
                  Submitted:
                </Text>
                <Text style={{ color: token.colorTextSecondary }}>
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </Text>
              </Space>
            </Card>

            <Divider
              style={{
                borderColor: token.colorBorder,
                margin: `${token.marginLG}px 0`,
              }}
            />

            {/* Initial Prompt */}
            <div style={{ marginBottom: token.marginLG }}>
              <Title
                level={5}
                style={{ color: token.colorText, marginBottom: token.marginSM }}
              >
                Initial Prompt
              </Title>
              <Card
                style={{
                  background: token.colorFillTertiary,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                }}
                bodyStyle={{
                  padding: token.padding,
                  color: token.colorText,
                }}
              >
                <Text
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {selectedSubmission.initialPrompt || "No prompt provided"}
                </Text>
              </Card>
            </div>

            {/* Generated Vision Output */}
            <div>
              <Title
                level={5}
                style={{ color: token.colorText, marginBottom: token.marginSM }}
              >
                AI-Generated Vision Concept
              </Title>
              <Card
                style={{
                  background: token.colorPrimaryBg,
                  border: `1px solid ${token.colorPrimaryBorder}`,
                  borderRadius: token.borderRadius,
                }}
                bodyStyle={{
                  padding: token.padding,
                  color: token.colorText,
                }}
              >
                {selectedSubmission.generatedVisionOutput ? (
                  <ReactMarkdown
                    components={{
                      h3: ({ ...props }) => (
                        <h3
                          style={{
                            color: token.colorPrimary,
                            marginTop: "20px",
                            marginBottom: "10px",
                            fontSize: token.fontSizeLG,
                            fontWeight: 600,
                          }}
                          {...props}
                        />
                      ),
                      h4: ({ ...props }) => (
                        <h4
                          style={{
                            color: token.colorTextSecondary,
                            marginTop: "15px",
                            marginBottom: "8px",
                            fontSize: token.fontSize,
                            fontWeight: 500,
                          }}
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => (
                        <p
                          style={{
                            margin: "0 0 10px 0",
                            lineHeight: token.lineHeight,
                            color: token.colorText,
                          }}
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          style={{
                            paddingLeft: token.marginLG,
                            marginBottom: "10px",
                            color: token.colorText,
                          }}
                          {...props}
                        />
                      ),
                      li: ({ ...props }) => (
                        <li
                          style={{
                            marginBottom: "5px",
                            color: token.colorText,
                          }}
                          {...props}
                        />
                      ),
                      strong: ({ ...props }) => (
                        <strong
                          style={{
                            color: token.colorText,
                            fontWeight: token.fontWeightStrong,
                          }}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {selectedSubmission.generatedVisionOutput}
                  </ReactMarkdown>
                ) : (
                  <Text
                    style={{
                      color: token.colorTextTertiary,
                      fontStyle: "italic",
                    }}
                  >
                    No vision board generated
                  </Text>
                )}
              </Card>
            </div>
          </div>
        )}
      </Modal>

      {/* Enhanced Custom Styles */}
      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(20px, -20px) scale(1.05); }
            66% { transform: translate(-15px, 15px) scale(0.95); }
          }

          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-20px, 15px) scale(1.03); }
            66% { transform: translate(25px, -10px) scale(0.97); }
          }

          /* Enhanced Table Styling */
          .ant-table-thead > tr > th {
            background: ${token.colorFillTertiary} !important;
            color: ${token.colorText} !important;
            border-bottom: 2px solid ${token.colorBorder} !important;
            font-weight: 600 !important;
            font-size: ${token.fontSizeSM}px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .ant-table-tbody > tr {
            background: ${token.colorBgContainer} !important;
            transition: all ${token.motionDurationFast} ${token.motionEaseOut} !important;
          }

          .ant-table-tbody > tr:hover > td {
            background: ${token.colorPrimaryBg} !important;
          }

          .ant-table-tbody > tr > td {
            border-bottom: 1px solid ${token.colorBorder} !important;
            color: ${token.colorText} !important;
          }

          /* Enhanced Pagination */
          .ant-pagination-item-active {
            background: ${token.colorPrimary} !important;
            border-color: ${token.colorPrimary} !important;
          }

          .ant-pagination-item-active a {
            color: ${token.colorTextLightSolid} !important;
            font-weight: 600;
          }

          /* Modal Enhancements */
          .ant-modal .ant-modal-content {
            border-radius: ${token.borderRadiusLG}px !important;
            box-shadow: ${token.boxShadow} !important;
          }

          @media (max-width: 768px) {
            .ant-table-thead > tr > th,
            .ant-table-tbody > tr > td {
              padding: 8px 12px !important;
              font-size: 13px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default VisionSubmissionsPage;
