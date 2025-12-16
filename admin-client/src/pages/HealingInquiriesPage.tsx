// admin-client/src/pages/HealingInquiriesPage.jsx
import React, { useState, useEffect, useCallback  } from 'react';
import {
  Table,
  Typography,
  App as AntApp,
  Button,
  Modal,
  Card,
  Divider,
  theme,
  Space,
  Tag,
  Grid,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarCircleOutlined, // Added for invoicing
} from "@ant-design/icons";
import api from "../api";
import ReactMarkdown from "react-markdown";
import { useNavigate, Link } from "react-router-dom";
// 1. IMPORT THE INVOICING MODAL
import InvoiceGeneratorModal from "../components/InvoiceGeneratorModal";

const { Title, Paragraph, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const HealingInquiriesPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // 2. STATE FOR INVOICING INTEGRATION
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  // Store the submission data we need to pass to the invoice modal
  const [submissionToInvoice, setSubmissionToInvoice] = useState<any>(null);

  const { message } = AntApp.useApp();
  const { token } = useToken();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const isMobile = !screens.md;

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/healing-submissions");
      setSubmissions(response.data);
    } catch (error) {
      console.error("Failed to fetch healing submissions:", error);
      if (error.response?.status !== 401) {
        message.error(
          error.response?.data?.error || "Failed to load healing inquiries."
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

  // 3. HANDLERS FOR INVOICING MODAL
  const handleOpenInvoiceModal = () => {
    // Transfer the currently selected submission data
    setSubmissionToInvoice(selectedSubmission);
    setIsModalVisible(false); // Close the details modal
    setIsInvoiceModalOpen(true); // Open the invoice modal
  };

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setSubmissionToInvoice(null);
    fetchSubmissions(); // Optional: Refresh the list after sending an invoice
  };

  const formatContactInfo = (contactInfo) => {
    if (!contactInfo) return "Not provided";
    if (contactInfo.includes("@")) return contactInfo; // Email
    if (contactInfo.replace(/\D/g, "").length >= 10) return contactInfo; // Phone
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
      render: (text, record) =>
        record.user ? (
          // If user is linked, show a link to their profile
          <Button
            type="link"
            icon={<UserOutlined />}
            onClick={() => navigate(`/clients/${record.user.id}`)}
            style={{ padding: 0, height: "auto" }}
          >
            {record.user.name} ({record.user.email})
          </Button>
        ) : (
          <Space>
            <UserOutlined style={{ color: token.colorTextTertiary }} />
            <Text
              style={{
                color: token.colorText,
                fontWeight: 500,
              }}
            >
              {formatContactInfo(text)}
            </Text>
            <Tag
              color={contactTypeColors[getContactType(text)]}
              style={{
                borderRadius: token.borderRadiusSM,
                fontSize: token.fontSizeSM,
                border: "none",
                margin: 0,
              }}
            >
              {getContactType(text)}
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
      title: "Initial Input",
      dataIndex: "struggleDescription",
      key: "struggleDescription",
      render: (text) => (
        <Text
          style={{
            color: token.colorTextSecondary,
            fontStyle: text ? "normal" : "italic",
          }}
        >
          {text
            ? text.substring(0, 80) + (text.length > 80 ? "..." : "")
            : "No description"}
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
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Enhanced Background Elements (omitted for brevity) */}
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
        {/* Header Section (omitted for brevity) */}
        <div style={{ marginBottom: token.marginLG }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: token.margin,
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
                Healing Inquiries
              </Title>
              <Paragraph
                style={{
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeLG,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Review and manage healing guidance submissions
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
        </div>

        {/* Stats Summary (omitted for brevity) */}
        <div style={{ marginBottom: token.marginLG }}>
          <Space
            size="small"
            wrap
            style={{
              background: token.colorBgContainer,
              padding: token.padding,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowSecondary,
              gap: "12px",
            }}
          >
            <div style={{ textAlign: "center" }}>
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
                {submissions.length}
              </Text>
            </div>
            <div style={{ textAlign: "center" }}>
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
                {
                  submissions.filter((sub) => {
                    const today = new Date();
                    const subDate = new Date(sub.createdAt);
                    return subDate.toDateString() === today.toDateString();
                  }).length
                }
              </Text>
            </div>
          </Space>
        </div>

        {/* Submissions Table (omitted for brevity) */}
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
            size={isMobile ? "small" : "middle"}
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

      {/* Details Modal */}
      <Modal
        title={
          <div>
            <Title
              level={4}
              style={{ color: token.colorTextHeading, margin: 0 }}
            >
              Healing Inquiry Details
            </Title>
            <Text
              style={{
                color: token.colorTextSecondary,
                fontSize: token.fontSizeSM,
              }}
            >
              Complete submission information
            </Text>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          // 4. GENERATE INVOICE BUTTON IN FOOTER
          <Button
            key="generate-invoice"
            icon={<DollarCircleOutlined />}
            onClick={handleOpenInvoiceModal}
            style={{
              background: token.colorInfo,
              border: `1px solid ${token.colorInfoBorder}`,
              color: token.colorWhite,
              borderRadius: token.borderRadius,
              fontWeight: 500,
            }}
          >
            Generate Quote/Invoice
          </Button>,
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
          <div style={{ color: token.colorText }}>
            {/* Contact Information (omitted for brevity) */}
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
                  {selectedSubmission.userId && (
                    <Button
                      type="link"
                      icon={<UserOutlined />}
                      onClick={() => {
                        navigate(`/clients/${selectedSubmission.userId}`);
                        handleCloseModal(); // Close modal on navigate
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      View Client Profile
                    </Button>
                  )}
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

            {/* Submission Date (omitted for brevity) */}
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

            {/* User Input Section (omitted for brevity) */}
            <div style={{ marginBottom: token.marginLG }}>
              <Title
                level={5}
                style={{ color: token.colorText, marginBottom: token.marginSM }}
              >
                User's Input
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
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <Text
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {selectedSubmission.struggleDescription ||
                    "No description provided"}
                </Text>
              </Card>
            </div>

            {/* AI Guidance Section (omitted for brevity) */}
            <div>
              <Title
                level={5}
                style={{ color: token.colorText, marginBottom: token.marginSM }}
              >
                AI Guidance Plan
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
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {selectedSubmission.generatedPlan ? (
                  <ReactMarkdown
                    components={{
                      p: (props) => (
                        <p
                          style={{
                            margin: `0 0 ${token.marginXS}px 0`,
                            color: "inherit",
                            lineHeight: token.lineHeight,
                          }}
                          {...props}
                        />
                      ),
                      strong: (props) => (
                        <strong
                          style={{
                            color: "inherit",
                            fontWeight: token.fontWeightStrong,
                          }}
                          {...props}
                        />
                      ),
                      ul: (props) => (
                        <ul
                          style={{
                            margin: `${token.marginXS}px 0`,
                            paddingLeft: token.marginLG,
                            color: "inherit",
                          }}
                          {...props}
                        />
                      ),
                      li: (props) => (
                        <li
                          style={{
                            marginBottom: token.marginXXS,
                            color: "inherit",
                          }}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {selectedSubmission.generatedPlan}
                  </ReactMarkdown>
                ) : (
                  <Text
                    style={{
                      color: token.colorTextTertiary,
                      fontStyle: "italic",
                    }}
                  >
                    No guidance plan generated
                  </Text>
                )}
              </Card>
            </div>
          </div>
        )}
      </Modal>

      {/* 5. RENDER THE INVOICE GENERATOR MODAL */}
      {submissionToInvoice && isInvoiceModalOpen && (
        <InvoiceGeneratorModal
          // Reference the submission ID for linking the invoice record
          referenceId={submissionToInvoice.id}
          // Set the module type
          referenceType="HEALING"
          onClose={handleCloseInvoiceModal}
          // Pre-fill client data from the submission details
          initialClient={{
            name: submissionToInvoice.user?.name || "Client",
            email: submissionToInvoice.contactInfo,
          }}
        />
      )}

      {/* Enhanced Custom Styles (omitted for brevity) */}
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

          /* General Table Styling (omitted for brevity) */
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

          /* Pagination and Modal Styles (omitted for brevity) */
          .ant-modal .ant-modal-content {
            border-radius: ${token.borderRadiusLG}px !important;
            box-shadow: ${token.boxShadow} !important;
          }
        `}
      </style>
    </div>
  );
};

export default HealingInquiriesPage;
