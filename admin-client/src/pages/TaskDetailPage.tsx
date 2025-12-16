// admin-client/src/pages/TaskDetailPage.jsx
import React, { useState, useEffect, useCallback  } from 'react';
import { useParams, Link } from "react-router-dom";
import {
  Button,
  Spin,
  Typography,
  App as AntApp,
  Tag,
  Card,
  Row,
  Col,
  Space,
  Modal,
  Input,
  Divider,
  theme,
  Grid,
  Tooltip,
  Avatar,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined,
  PaperClipOutlined,
  DollarCircleOutlined,
  UserAddOutlined,
  TeamOutlined,
  BuildOutlined,
  ApartmentOutlined,
  CalculatorOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import TaskDocumentUploader from "../components/TaskDocumentUploader";
import TaskDocumentList from "../components/TaskDocumentList";
import TaskAuditLog from "../components/TaskAuditLog";
import AssignTaskModal from "../components/AssignTaskModal";
import InvoiceGeneratorModal from "../components/InvoiceGeneratorModal";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const getStatusColor = (status, token) => {
  const colorMap = {
    PENDING_ASSIGNMENT: token.colorError,
    PENDING_ARCHITECT_DESIGN: token.colorWarning,
    PENDING_ENGINEER_DESIGN: token.colorWarning,
    PENDING_QUANTIFYING: token.colorInfo,
    PENDING_DESIGN_APPROVAL: token.colorWarning,
    PENDING_FINAL_APPROVAL: token.colorWarning,
    PENDING_INVOICING: token.colorInfo,
    COMPLETED: token.colorSuccess,
    REJECTED: token.colorError,
  };
  return colorMap[status] || token.colorTextTertiary;
};

// Helper to determine if task can be assigned
const canAssignTask = (task) => {
  if (!task) return false;
  const assignableStates = [
    "PENDING_ASSIGNMENT",
    "PENDING_ARCHITECT_DESIGN",
    "PENDING_ENGINEER_DESIGN",
    "PENDING_QUANTIFYING",
  ];
  return assignableStates.includes(task.status);
};

// Get the next expected role based on current status
const getExpectedRoleForAssignment = (taskStatus) => {
  switch (taskStatus) {
    case "PENDING_ASSIGNMENT":
      return ["ENGINEER", "ARCHITECT"];
    case "PENDING_ARCHITECT_DESIGN":
      return ["ENGINEER"];
    case "PENDING_ENGINEER_DESIGN":
      return ["QUANTITY_SURVEYOR", "ENGINEER"];
    case "PENDING_QUANTIFYING":
      return ["QUANTITY_SURVEYOR"];
    default:
      return [];
  }
};

// Get icon for role
const getRoleIcon = (role) => {
  switch (role) {
    case "ARCHITECT":
      return <ApartmentOutlined />;
    case "ENGINEER":
      return <BuildOutlined />;
    case "QUANTITY_SURVEYOR":
      return <CalculatorOutlined />;
    default:
      return <UserOutlined />;
  }
};

// Get role display name
const getRoleDisplayName = (role) => {
  switch (role) {
    case "ARCHITECT":
      return "Architect";
    case "ENGINEER":
      return "Engineer";
    case "QUANTITY_SURVEYOR":
      return "Quantity Surveyor";
    case "SUPER_USER":
      return "Super User";
    default:
      return role;
  }
};

// Get status description
const getStatusDescription = (status) => {
  const descriptions = {
    PENDING_ASSIGNMENT: "Task is waiting to be assigned to an Architect or Engineer",
    PENDING_ARCHITECT_DESIGN: "Assigned to Architect - waiting for design upload",
    PENDING_ENGINEER_DESIGN: "Assigned to Engineer - waiting for design upload",
    PENDING_QUANTIFYING: "Assigned to Quantity Surveyor - waiting for quantification",
    PENDING_DESIGN_APPROVAL: "Design submitted - waiting for approval",
    PENDING_FINAL_APPROVAL: "Quotation submitted - waiting for final approval",
    PENDING_INVOICING: "Ready for invoicing",
    COMPLETED: "Task completed",
    REJECTED: "Task rejected",
  };
  return descriptions[status] || "";
};

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const { message } = AntApp.useApp();
  const { user } = useAuth();
  const { token } = useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fetchTask = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/tasks/${taskId}`);
      setTask(response.data);
    } catch (error) {
      console.error("Fetch task error:", error);
      message.error("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  }, [taskId, message]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleOpenAssignModal = () => setIsAssignModalOpen(true);
  const handleAssignModalClose = () => setIsAssignModalOpen(false);
  const handleTaskAssignedOrReassigned = () => {
    handleAssignModalClose();
    fetchTask();
    message.success("Task assigned successfully!");
  };

  const handleOpenInvoiceModal = () => setIsInvoiceModalOpen(true);
  const handleCloseInvoiceModal = () => setIsInvoiceModalOpen(false);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/tasks/${taskId}/approve`);
      message.success("Task approved!");
      fetchTask();
    } catch (error) {
      console.error("Approve task error:", error);
      message.error("Failed to approve task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      message.error("A reason for rejection is required.");
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/admin/tasks/${taskId}/reject`, { reason: rejectReason });
      message.success("Task rejected and sent back.");
      fetchTask();
      setIsRejectModalVisible(false);
      setRejectReason("");
    } catch (error) {
      console.error("Reject task error:", error);
      message.error("Failed to reject task.");
    } finally {
      setActionLoading(false);
    }
  };

  // ====== ASSIGNMENT LOGIC ======
  const renderAssignmentActions = () => {
    if (user.role !== "SUPER_USER" || !task) return null;

    const isAssignable = canAssignTask(task);
    const isAssigned = !!task.assignedToId;
    const expectedRoles = getExpectedRoleForAssignment(task.status);
    
    if (!isAssignable) return null;

    if (!isAssigned) {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleOpenAssignModal}
            size="large"
            style={{
              borderRadius: token.borderRadius,
              fontWeight: 600,
            }}
          >
            Assign Task
          </Button>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Expected role: {expectedRoles.map(r => getRoleDisplayName(r)).join(" or ")}
          </Text>
        </Space>
      );
    } else if (task.status !== "COMPLETED" && task.status !== "REJECTED") {
      return (
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={<SwapOutlined />}
            onClick={handleOpenAssignModal}
            style={{
              background: token.colorPrimaryBg,
              border: `1px solid ${token.colorPrimaryBorder}`,
              color: token.colorPrimaryText,
              borderRadius: token.borderRadius,
              fontWeight: 500,
            }}
          >
            Reassign Task
          </Button>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Can reassign to: {expectedRoles.map(r => getRoleDisplayName(r)).join(" or ")}
          </Text>
        </Space>
      );
    }
    return null;
  };

  const renderSuperUserActions = () => {
    if (user.role !== "SUPER_USER" || !task) return null;

    const isPendingApproval =
      task.status === "PENDING_DESIGN_APPROVAL" ||
      task.status === "PENDING_FINAL_APPROVAL";

    const isReadyForQuoting = task.status === "PENDING_INVOICING";

    if (isPendingApproval || isReadyForQuoting) {
      return (
        <Card
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            marginBottom: token.margin,
          }}
          bodyStyle={{ padding: token.paddingLG }}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={5} style={{ color: token.colorText, margin: 0 }}>
              <FileTextOutlined style={{ marginRight: token.marginXS }} />
              Approval Actions
            </Title>
            <Space size="middle" wrap>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={actionLoading}
                onClick={handleApprove}
                size="large"
                style={{
                  background: token.colorSuccess,
                  borderColor: token.colorSuccess,
                  borderRadius: token.borderRadius,
                  fontWeight: 600,
                }}
              >
                Approve Task
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                loading={actionLoading}
                onClick={() => setIsRejectModalVisible(true)}
                size="large"
                style={{
                  borderRadius: token.borderRadius,
                  fontWeight: 600,
                }}
              >
                Reject Task
              </Button>

              {isReadyForQuoting && (
                <Button
                  icon={<DollarCircleOutlined />}
                  onClick={handleOpenInvoiceModal}
                  size="large"
                  style={{
                    background: token.colorInfo,
                    borderColor: token.colorInfo,
                    color: token.colorWhite,
                    borderRadius: token.borderRadius,
                    fontWeight: 600,
                  }}
                >
                  Generate Quote/Invoice
                </Button>
              )}
            </Space>
          </Space>
        </Card>
      );
    }
    return null;
  };

  const renderTeamMemberUploader = () => {
    if (user.role === "SUPER_USER" || !task) return null;
    
    // Check if current user is the assignee
    const isAssignee = user.id === task.assignedTo?.id;
    if (!isAssignee) return null;

    // Determine which document type to upload based on status
    switch (task.status) {
      case "PENDING_ARCHITECT_DESIGN":
        if (user.role === "ARCHITECT") {
          return (
            <TaskDocumentUploader
              task={task}
              documentType="ARCHITECT_DESIGN"
              onUploadSuccess={fetchTask}
            />
          );
        }
        break;
        
      case "PENDING_ENGINEER_DESIGN":
        if (user.role === "ENGINEER") {
          return (
            <TaskDocumentUploader
              task={task}
              documentType="ENGINEER_DESIGN"
              onUploadSuccess={fetchTask}
            />
          );
        }
        break;
        
      case "PENDING_QUANTIFYING":
        if (user.role === "QUANTITY_SURVEYOR" || user.role === "ENGINEER") {
          return (
            <TaskDocumentUploader
              task={task}
              documentType="QUOTATION"
              onUploadSuccess={fetchTask}
            />
          );
        }
        break;
        
      default:
        return null;
    }
    
    return null;
  };

  const renderWorkflowVisualization = () => {
    if (!task) return null;
    
    const workflowSteps = [
      { status: "PENDING_ASSIGNMENT", label: "Initial Assignment", icon: <UserAddOutlined /> },
      { status: "PENDING_ARCHITECT_DESIGN", label: "Architect Design", icon: <ApartmentOutlined /> },
      { status: "PENDING_ENGINEER_DESIGN", label: "Engineer Design", icon: <BuildOutlined /> },
      { status: "PENDING_QUANTIFYING", label: "Quantification", icon: <CalculatorOutlined /> },
      { status: "PENDING_INVOICING", label: "Invoicing", icon: <DollarCircleOutlined /> },
      { status: "COMPLETED", label: "Completed", icon: <CheckCircleOutlined /> },
    ];
    
    const currentStepIndex = workflowSteps.findIndex(step => step.status === task.status);
    
    return (
      <Card
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary,
          marginBottom: token.margin,
        }}
        bodyStyle={{ padding: token.padding }}
      >
        <Title level={5} style={{ marginBottom: token.margin, color: token.colorText }}>
          Workflow Progress
        </Title>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: token.marginXS }}>
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            
            return (
              <div key={step.status} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '120px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    flex: 1,
                  }}
                >
                  {/* Connection line */}
                  {index > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '-50%',
                        width: '100%',
                        height: '2px',
                        backgroundColor: isCompleted ? token.colorPrimary : token.colorBorder,
                        zIndex: 1,
                      }}
                    />
                  )}
                  
                  {/* Step circle */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isCompleted ? token.colorPrimary : 
                                    isCurrent ? token.colorWarning : token.colorBgContainer,
                      border: `2px solid ${isCompleted ? token.colorPrimary : 
                                          isCurrent ? token.colorWarning : token.colorBorder}`,
                      color: isCompleted ? token.colorWhite : 
                            isCurrent ? token.colorWhite : token.colorTextTertiary,
                      zIndex: 2,
                      position: 'relative',
                    }}
                  >
                    {step.icon}
                  </div>
                  
                  {/* Step label */}
                  <Text
                    style={{
                      marginTop: token.marginXS,
                      fontSize: token.fontSizeSM,
                      textAlign: 'center',
                      color: isCurrent ? token.colorText : token.colorTextTertiary,
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
        
        <Divider style={{ margin: `${token.margin}px 0` }} />
        
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Current: {task.status.replace(/_/g, " ")} - {getStatusDescription(task.status)}
        </Text>
      </Card>
    );
  };

  const renderStatusBadge = () => {
    if (!task) return null;
    
    let statusText = task.status.replace(/_/g, " ");
    
    return (
      <Tooltip title={getStatusDescription(task.status)}>
        <Badge
          status={
            task.status.includes("PENDING") ? "processing" :
            task.status === "COMPLETED" ? "success" :
            task.status === "REJECTED" ? "error" : "default"
          }
          text={
            <Tag
              color={getStatusColor(task.status, token)}
              style={{
                borderRadius: token.borderRadius,
                padding: "6px 16px",
                fontSize: token.fontSizeSM,
                fontWeight: 600,
                border: "none",
                color: token.colorTextLightSolid,
                cursor: "pointer",
              }}
            >
              {statusText}
            </Tag>
          }
        />
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          background: token.colorBgLayout,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  const InfoCard = ({ icon, label, value }) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: token.marginSM,
        padding: token.padding,
        background: token.colorFillTertiary,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
      }}
    >
      <div
        style={{
          color: token.colorPrimary,
          fontSize: "18px",
          marginTop: "2px",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <Text
          style={{
            color: token.colorTextTertiary,
            fontSize: token.fontSizeSM,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "block",
            marginBottom: "4px",
            fontWeight: 500,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: token.colorText,
            fontSize: token.fontSize,
            display: "block",
            fontWeight: 400,
          }}
        >
          {value || "Not provided"}
        </Text>
      </div>
    </div>
  );

  const findPendingDocument = () => {
    if (!task || !task.documents) return null;
    
    let expectedDocType = null;
    switch (task.status) {
      case "PENDING_DESIGN_APPROVAL":
        expectedDocType = ["ARCHITECT_DESIGN", "ENGINEER_DESIGN"];
        break;
      case "PENDING_FINAL_APPROVAL":
      case "PENDING_INVOICING":
        expectedDocType = ["QUOTATION"];
        break;
      default:
        return null;
    }

    const relevantDocs = task.documents
      .filter((doc) => expectedDocType.includes(doc.documentType))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return relevantDocs.length > 0 ? relevantDocs[0] : null;
  };

  const pendingDocument = findPendingDocument();
  const pendingDocumentUrl = pendingDocument
    ? `${BACKEND_URL}${pendingDocument.filepath}`
    : null;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: token.colorBgLayout,
      }}
    >
      {/* Background elements */}
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
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
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
            <div style={{ flex: 1 }}>
              <Space>
                <Link to="/">
                  <Button
                    icon={<ArrowLeftOutlined />}
                    style={{
                      background: token.colorPrimaryBg,
                      border: `1px solid ${token.colorPrimaryBorder}`,
                      color: token.colorPrimaryText,
                      borderRadius: token.borderRadius,
                      fontWeight: 500,
                    }}
                  >
                    Back to Dashboard
                  </Button>
                </Link>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchTask}
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
              </Space>
            </div>
            
            {/* Assignment Action Button */}
            {user.role === "SUPER_USER" && (
              <div style={{ minWidth: '200px' }}>
                {renderAssignmentActions()}
              </div>
            )}
          </div>
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: token.margin,
              flexWrap: "wrap",
              marginBottom: token.marginXS,
            }}
          >
            <Title
              level={2}
              style={{
                color: token.colorTextHeading,
                margin: 0,
                fontSize: isMobile ? "24px" : "32px",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {task.title}
            </Title>
            {renderStatusBadge()}
          </div>
          
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSize,
            }}
          >
            Task ID: {task.id}
          </Text>
        </div>

        {/* Workflow Visualization */}
        {renderWorkflowVisualization()}

        {/* Main Content Grid */}
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Row gutter={[24, 24]}>
            {/* Left Column */}
            <Col xs={24} lg={16}>
              {task.submission.document &&
                (() => {
                  const document = task.submission.document;
                  let apiBase =
                    import.meta.env.VITE_API_BASE_URL ||
                    "https://api.qsi.africa/api";

                  let rootUrl;
                  try {
                    const urlObj = new URL(apiBase);
                    rootUrl = urlObj.origin;
                  } catch {
                    rootUrl = apiBase.replace("/api", "");
                  }

                  const fileUrl = `${rootUrl}/uploads/${document.fileName}`;

                  return (
                    <Card
                      style={{
                        background: token.colorBgContainer,
                        border: `1px solid ${token.colorBorder}`,
                        borderRadius: token.borderRadiusLG,
                        boxShadow: token.boxShadowSecondary,
                        marginBottom: token.margin,
                      }}
                      bodyStyle={{ padding: token.paddingLG }}
                    >
                      <Title
                        level={4}
                        style={{ color: token.colorText, margin: "0 0 16px 0" }}
                      >
                        <PaperClipOutlined
                          style={{ marginRight: token.marginSM }}
                        />
                        Client Documents
                      </Title>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: token.colorFillAlter,
                          padding: "12px 16px",
                          borderRadius: token.borderRadius,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <FileTextOutlined
                            style={{
                              fontSize: "24px",
                              color: token.colorPrimary,
                            }}
                          />
                          <div>
                            <Text
                              strong
                              style={{
                                display: "block",
                                color: token.colorText,
                              }}
                            >
                              {document.originalName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {formatFileSize(document.fileSize)} •{" "}
                              {document.mimeType}
                            </Text>
                          </div>
                        </div>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none" }}
                        >
                          <Button type="primary" icon={<DownloadOutlined />}>
                            Download
                          </Button>
                        </a>
                      </div>
                    </Card>
                  );
                })()}

              {/* Task Overview */}
              <Card
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                  marginBottom: token.margin,
                }}
                bodyStyle={{ padding: token.paddingLG }}
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Title
                    level={4}
                    style={{ color: token.colorText, margin: 0 }}
                  >
                    <InfoCircleOutlined
                      style={{ marginRight: token.marginSM }}
                    />
                    Task Overview
                  </Title>
                  <div>
                    <Text
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: token.fontSizeSM,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "block",
                        marginBottom: token.marginSM,
                        fontWeight: 500,
                      }}
                    >
                      Client Request
                    </Text>
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
                      <Paragraph
                        style={{
                          margin: 0,
                          lineHeight: token.lineHeight,
                          fontSize: token.fontSize,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {task?.description}
                      </Paragraph>
                    </Card>
                  </div>
                  <Divider
                    style={{
                      borderColor: token.colorBorder,
                      margin: `${token.margin}px 0`,
                    }}
                  />
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <InfoCard
                        icon={<CalendarOutlined />}
                        label="Submitted On"
                        value={new Date(task.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <InfoCard
                        icon={<MailOutlined />}
                        label="Client Contact"
                        value={task.submission.contactInfo}
                      />
                    </Col>
                  </Row>
                </Space>
              </Card>

              {/* Pending Document */}
              {pendingDocument && user.role === "SUPER_USER" && (
                <Card
                  style={{
                    background: token.colorWarningBg,
                    border: `1px solid ${token.colorWarningBorder}`,
                    borderRadius: token.borderRadiusLG,
                    boxShadow: token.boxShadowSecondary,
                    marginBottom: token.margin,
                  }}
                  bodyStyle={{ padding: token.padding }}
                >
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Text
                      strong
                      style={{
                        color: token.colorWarningText,
                        fontSize: token.fontSizeLG,
                      }}
                    >
                      Document Pending{" "}
                      {pendingDocument.documentType === "ARCHITECT_DESIGN" ? "Architect Design" :
                       pendingDocument.documentType === "ENGINEER_DESIGN" ? "Engineer Design" :
                       "Quotation"}{" "}
                      Approval
                    </Text>
                    <Space>
                      <Text style={{ color: token.colorText }}>
                        {pendingDocument.filename}
                      </Text>
                      <Button
                        icon={<DownloadOutlined />}
                        href={pendingDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        style={{
                          background: token.colorPrimaryBg,
                          border: `1px solid ${token.colorPrimaryBorder}`,
                          color: token.colorPrimaryText,
                          borderRadius: token.borderRadius,
                        }}
                      >
                        Download
                      </Button>
                    </Space>
                    <Text
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      Uploaded on{" "}
                      {new Date(pendingDocument.createdAt).toLocaleString()}
                    </Text>
                  </Space>
                </Card>
              )}

              {/* Super User Actions */}
              {renderSuperUserActions()}

              {/* Team Member Uploader */}
              {renderTeamMemberUploader()}

              {/* Internal Task Documents List */}
              <Card
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                }}
                bodyStyle={{ padding: token.paddingLG }}
              >
                <Title
                  level={4}
                  style={{
                    color: token.colorText,
                    marginBottom: token.margin,
                    marginTop: 0,
                  }}
                >
                  Internal Task Documents
                </Title>
                <TaskDocumentList documents={task.documents} />
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={8}>
              {/* Assignment Card */}
              <Card
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                  marginBottom: token.margin,
                }}
                bodyStyle={{ padding: token.paddingLG }}
              >
                <Title
                  level={4}
                  style={{
                    color: token.colorText,
                    marginBottom: token.margin,
                    marginTop: 0,
                  }}
                >
                  <UserOutlined style={{ marginRight: token.marginSM }} />
                  Current Assignment
                </Title>
                
                {task.assignedTo ? (
                  <div>
                    <Card
                      style={{
                        background: token.colorPrimaryBg,
                        border: `1px solid ${token.colorPrimaryBorder}`,
                        borderRadius: token.borderRadius,
                        marginBottom: token.marginSM,
                      }}
                      bodyStyle={{ padding: token.padding }}
                    >
                      <Space align="center" style={{ width: '100%' }}>
                        <Avatar
                          style={{
                            backgroundColor: token.colorPrimary,
                            color: token.colorWhite,
                          }}
                          icon={getRoleIcon(task.assignedTo.role)}
                        />
                        <div style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: token.colorPrimaryText,
                              fontSize: token.fontSizeLG,
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            {task.assignedTo.name}
                          </Text>
                          <Text
                            style={{
                              color: token.colorPrimaryText,
                              fontSize: token.fontSizeSM,
                              opacity: 0.8,
                            }}
                          >
                            {task.assignedTo.email}
                          </Text>
                          <Tag
                            color="blue"
                            style={{
                              marginTop: token.marginXS,
                              borderRadius: token.borderRadiusSM,
                            }}
                          >
                            {getRoleIcon(task.assignedTo.role)}
                            {" "}{getRoleDisplayName(task.assignedTo.role)}
                          </Tag>
                        </div>
                      </Space>
                    </Card>
                    
                    {/* Assignment Info */}
                    {task.assignedBy && (
                      <div style={{ marginTop: token.marginSM }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: token.fontSizeSM }}
                        >
                          Assigned by: {task.assignedBy.name}
                        </Text>
                        <br />
                        <Text
                          type="secondary"
                          style={{ fontSize: token.fontSizeSM }}
                        >
                          On: {new Date(task.updatedAt).toLocaleDateString()}
                        </Text>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Card
                      style={{
                        background: token.colorErrorBg,
                        border: `1px solid ${token.colorErrorBorder}`,
                        borderRadius: token.borderRadius,
                      }}
                      bodyStyle={{ padding: token.padding }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text
                          style={{
                            color: token.colorErrorText,
                            fontWeight: 600,
                          }}
                        >
                          ⚠️ No Assignment
                        </Text>
                        <Text
                          style={{
                            color: token.colorErrorText,
                            fontSize: token.fontSizeSM,
                          }}
                        >
                          {getStatusDescription(task.status)}
                        </Text>
                        {user.role === "SUPER_USER" && canAssignTask(task) && (
                          <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={handleOpenAssignModal}
                            size="small"
                            style={{ marginTop: token.marginXS }}
                          >
                            Assign Task
                          </Button>
                        )}
                      </Space>
                    </Card>
                  </div>
                )}
              </Card>

              {/* Workflow Status Card */}
              <Card
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                  marginBottom: token.margin,
                }}
                bodyStyle={{ padding: token.paddingLG }}
              >
                <Title level={5} style={{ marginBottom: token.margin, color: token.colorText }}>
                  Workflow Status
                </Title>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Current Status:</Text>
                    <Text strong>{task.status.replace(/_/g, " ")}</Text>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Next Action:</Text>
                    <Text strong>
                      {task.status === "PENDING_ASSIGNMENT" ? "Assign to Architect/Engineer" :
                       task.status === "PENDING_ARCHITECT_DESIGN" ? "Architect design upload" :
                       task.status === "PENDING_ENGINEER_DESIGN" ? "Engineer design upload" :
                       task.status === "PENDING_QUANTIFYING" ? "Quantity Surveyor quotation" :
                       "Awaiting approval"}
                    </Text>
                  </div>
                  
                  <Divider style={{ margin: `${token.marginXS}px 0` }} />
                  
                  <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    {getStatusDescription(task.status)}
                  </Text>
                </Space>
              </Card>

              {/* Task History */}
              <Card
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                }}
                bodyStyle={{ padding: 0 }}
              >
                <div style={{ padding: token.paddingLG }}>
                  <Title
                    level={4}
                    style={{
                      color: token.colorText,
                      marginBottom: token.margin,
                      marginTop: 0,
                    }}
                  >
                    Task History
                  </Title>
                </div>
                <TaskAuditLog logs={task.auditLogs} />
              </Card>
            </Col>
          </Row>
        </Space>
      </div>

      {/* Modals */}
      <Modal
        title={
          <Text
            style={{
              color: token.colorText,
              fontSize: token.fontSizeLG,
              fontWeight: 600,
            }}
          >
            Reject Task
          </Text>
        }
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        confirmLoading={actionLoading}
        okText="Reject Task"
        cancelText="Cancel"
        styles={{
          content: {
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
          },
          header: {
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorder}`,
          },
          body: { color: token.colorText },
        }}
        okButtonProps={{ danger: true, style: { fontWeight: 600 } }}
        cancelButtonProps={{
          style: {
            background: token.colorPrimaryBg,
            border: `1px solid ${token.colorPrimaryBorder}`,
            color: token.colorPrimaryText,
            fontWeight: 500,
          },
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Text style={{ color: token.colorText }}>
            Please provide a reason for rejecting this task:
          </Text>
          <TextArea
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              color: token.colorText,
              borderRadius: token.borderRadius,
            }}
          />
        </Space>
      </Modal>

      {/* Assign Task Modal */}
      {task && (
        <AssignTaskModal
          task={task}
          open={isAssignModalOpen}
          onCancel={handleAssignModalClose}
          onTaskAssigned={handleTaskAssignedOrReassigned}
          isReassign={!!task.assignedToId}
          // Pass expected roles to the modal
          expectedRoles={getExpectedRoleForAssignment(task.status)}
        />
      )}

      {/* Invoice Generator Modal */}
      {task && isInvoiceModalOpen && (
        <InvoiceGeneratorModal
          referenceId={taskId}
          referenceType="INFRASTRUCTURE"
          onClose={handleCloseInvoiceModal}
          initialClient={{
            name: task.submission.contactName,
            email: task.submission.contactInfo,
          }}
        />
      )}

      {/* Styles */}
      <style>
        {`
          @keyframes float1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -20px) scale(1.05); } 66% { transform: translate(-15px, 15px) scale(0.95); } }
          @keyframes float2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-20px, 15px) scale(1.03); } 66% { transform: translate(25px, -10px) scale(0.97); } }
          .ant-modal .ant-modal-content { border-radius: ${token.borderRadiusLG}px !important; box-shadow: ${token.boxShadow} !important; }
        `}
      </style>
    </div>
  );
};

export default TaskDetailPage;