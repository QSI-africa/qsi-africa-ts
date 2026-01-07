// admin-client/src/pages/TaskDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
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
  List,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  BuildOutlined,
  ApartmentOutlined,
  CalculatorOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  PaperClipOutlined,
  DollarCircleOutlined,
  SwapOutlined,
  UserAddOutlined,
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

// --- Helper Functions ---
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

const canAssignTask = (task) => {
  if (!task || task.status === "COMPLETED" || task.status === "REJECTED")
    return false;
  return [
    "PENDING_ASSIGNMENT",
    "PENDING_ARCHITECT_DESIGN",
    "PENDING_ENGINEER_DESIGN",
    "PENDING_QUANTIFYING",
  ].includes(task.status);
};

const getExpectedRoleForAssignment = (taskStatus) => {
  switch (taskStatus) {
    case "PENDING_ASSIGNMENT":
      return ["ARCHITECT", "ENGINEER"];
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

const getRoleDisplayName = (role) => {
  const roles = {
    ARCHITECT: "Architect",
    ENGINEER: "Engineer",
    QUANTITY_SURVEYOR: "Quantity Surveyor",
    SUPER_USER: "Super User",
  };
  return roles[role] || role;
};

const getStatusDescription = (status) => {
  const descriptions = {
    PENDING_ASSIGNMENT:
      "Waiting for initial assignment (Architect or Engineer).",
    PENDING_ARCHITECT_DESIGN:
      "Architect is drafting designs. Will go to Engineer next.",
    PENDING_ENGINEER_DESIGN:
      "Engineer finalizing technical specs before Admin review.",
    PENDING_DESIGN_APPROVAL: "Designs submitted. Waiting for Admin review.",
    PENDING_QUANTIFYING: "Specialist is calculating material requirements.",
    PENDING_FINAL_APPROVAL: "Quote submitted. Awaiting final sign-off.",
    PENDING_INVOICING: "Approved. Ready for financial processing.",
    COMPLETED: "Task successfully completed.",
    REJECTED: "Work rejected. Sent back for revision.",
  };
  return descriptions[status] || "";
};

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { message } = AntApp.useApp();
  const { user } = useAuth();
  const { token } = useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getBaseUrl = () => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
    try {
      const urlObj = new URL(apiBase);
      return urlObj.origin;
    } catch {
      return apiBase.replace("/api", "");
    }
  };

  const BACKEND_URL = getBaseUrl();

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
  const handleCloseInvoiceModal = () => setIsInvoiceModalOpen(false);

  const handleTaskAssignedOrReassigned = () => {
    setIsAssignModalOpen(false);
    fetchTask();
    message.success("Task updated successfully!");
  };

  const handleStatusUpdate = async (nextStatus, successMsg) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/tasks/${taskId}/status`, { status: nextStatus });
      message.success(successMsg || "Moved to next stage.");
      fetchTask();
    } catch (error) {
      message.error("Failed to update status.");
      console.error("error",error)
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.put(`/admin/tasks/${taskId}/approve`);
      message.success("Approved!");
      fetchTask();
    } catch (error) {
      message.error("Approval failed.");
      console.error("error",error)

    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return message.error("Reason required.");
    setActionLoading(true);
    try {
      await api.put(`/admin/tasks/${taskId}/reject`, { reason: rejectReason });
      message.success("Rejected.");
      fetchTask();
      setIsRejectModalVisible(false);
      setRejectReason("");
    } catch (error) {
      message.error("Rejection failed.");
      console.error("error",error)
    } finally {
      setActionLoading(false);
    }
  };

  const WorkflowDeliverables = ({ docs, currentStatus }) => {
    if (!docs || docs.length === 0)
      return (
        <Alert message="No deliverables uploaded yet." type="info" showIcon />
      );
    return (
      <List
        dataSource={docs}
        renderItem={(item) => {
          const isUrgent =
            currentStatus === "PENDING_DESIGN_APPROVAL" ||
            currentStatus === "PENDING_FINAL_APPROVAL";
          const fileUrl = `${BACKEND_URL}${
            item.filepath || "/uploads/" + item.filename
          }`;
          return (
            <div
              style={{
                marginBottom: 12,
                padding: 16,
                background: isUrgent
                  ? token.colorWarningBg
                  : token.colorFillTertiary,
                border: `1px solid ${
                  isUrgent ? token.colorWarningBorder : token.colorBorder
                }`,
                borderRadius: token.borderRadius,
              }}
            >
              <Row align="middle" gutter={16}>
                <Col>
                  <BuildOutlined
                    style={{ fontSize: 20, color: token.colorPrimary }}
                  />
                </Col>
                <Col flex="auto">
                  <Text strong>{item.filename}</Text>
                  <br />
                  <Space
                    split={<Divider type="vertical" />}
                    style={{ fontSize: 12 }}
                  >
                    <Tag color="blue">
                      {item.documentType.replace(/_/g, " ")}
                    </Tag>
                    <Text type="secondary">{item.uploadedBy?.name}</Text>
                  </Space>
                </Col>
                <Col>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    href={fileUrl}
                    target="_blank"
                  >
                    Download
                  </Button>
                </Col>
              </Row>
            </div>
          );
        }}
      />
    );
  };

  const renderWorkflowVisualization = () => {
    if (!task) return null;
    const workflowSteps = [
      {
        status: "PENDING_ASSIGNMENT",
        label: "Assignment",
        icon: <UserAddOutlined />,
      },
      {
        status: "PENDING_ARCHITECT_DESIGN",
        label: "Architect",
        icon: <ApartmentOutlined />,
      },
      {
        status: "PENDING_ENGINEER_DESIGN",
        label: "Engineer",
        icon: <BuildOutlined />,
      },
      {
        status: "PENDING_DESIGN_APPROVAL",
        label: "Review",
        icon: <EyeOutlined />,
      },
      {
        status: "PENDING_QUANTIFYING",
        label: "Quantifying",
        icon: <CalculatorOutlined />,
      },
      {
        status: "PENDING_FINAL_APPROVAL",
        label: "Final Review",
        icon: <CheckCircleOutlined />,
      },
      {
        status: "PENDING_INVOICING",
        label: "Financials",
        icon: <DollarCircleOutlined />,
      },
      { status: "COMPLETED", label: "Done", icon: <CheckCircleOutlined /> },
    ];
    const currentStepIndex = workflowSteps.findIndex(
      (s) => s.status === task.status
    );
    return (
      <Card
        style={{
          background: token.colorBgContainer,
          marginBottom: token.margin,
        }}
        bodyStyle={{ padding: token.padding }}
      >
        <Title level={5}>Workflow Progress</Title>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div
                key={step.status}
                style={{ textAlign: "center", flex: 1, position: "relative" }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isCompleted
                      ? token.colorSuccess
                      : isCurrent
                      ? token.colorWarning
                      : token.colorBgContainer,
                    color:
                      isCompleted || isCurrent
                        ? "#fff"
                        : token.colorTextDisabled,
                    border: `2px solid ${
                      isCompleted
                        ? token.colorSuccess
                        : isCurrent
                        ? token.colorWarning
                        : token.colorBorder
                    }`,
                  }}
                >
                  {step.icon}
                </div>
                <Text
                  style={{
                    fontSize: 10,
                    display: "block",
                    marginTop: 8,
                    fontWeight: isCurrent ? "bold" : "normal",
                  }}
                >
                  {step.label}
                </Text>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderSubmitAction = () => {
    if (!task || user.id !== task.assignedToId || task.status === "COMPLETED")
      return null;

    // ARCHITECT HAND-OFF: Goes to Engineer Design
    if (task.status === "PENDING_ARCHITECT_DESIGN") {
      const hasDoc = task.taskDocuments?.some(
        (d) => d.documentType === "ARCHITECT_DESIGN"
      );
      if (hasDoc) {
        return (
          <Card
            style={{
              marginBottom: token.margin,
              border: `1px solid ${token.colorInfo}`,
            }}
          >
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Text strong>
                Design ready? Hand over to the Engineer for technical
                specifications.
              </Text>
              <Button
                type="primary"
                loading={actionLoading}
                icon={<SwapOutlined />}
                onClick={() =>
                  handleStatusUpdate(
                    "PENDING_ENGINEER_DESIGN",
                    "Submitted! Admin can now assign the Engineer."
                  )
                }
              >
                Hand over to Engineer
              </Button>
            </Space>
          </Card>
        );
      }
    }

    // ENGINEER SUBMISSION: Goes to Review (Design Approval)
    if (task.status === "PENDING_ENGINEER_DESIGN") {
      const hasDoc = task.taskDocuments?.some(
        (d) => d.documentType === "ENGINEER_DESIGN"
      );
      if (hasDoc) {
        return (
          <Card
            style={{
              marginBottom: token.margin,
              border: `1px solid ${token.colorSuccess}`,
            }}
          >
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Text strong>Technical specs ready for Management Review?</Text>
              <Button
                type="primary"
                loading={actionLoading}
                style={{ background: token.colorSuccess }}
                onClick={() =>
                  handleStatusUpdate(
                    "PENDING_DESIGN_APPROVAL",
                    "Submitted for Review!"
                  )
                }
              >
                Submit for Approval
              </Button>
            </Space>
          </Card>
        );
      }
    }

    // QS SUBMISSION: Goes to Final Review
    if (task.status === "PENDING_QUANTIFYING") {
      const hasDoc = task.taskDocuments?.some(
        (d) => d.documentType === "QUOTATION"
      );
      if (hasDoc) {
        return (
          <Card
            style={{
              marginBottom: token.margin,
              border: `1px solid ${token.colorSuccess}`,
            }}
          >
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Text strong>
                Bill of Quantities finished. Submit for final sign-off?
              </Text>
              <Button
                type="primary"
                loading={actionLoading}
                style={{ background: token.colorSuccess }}
                onClick={() =>
                  handleStatusUpdate(
                    "PENDING_FINAL_APPROVAL",
                    "Quotation submitted for review!"
                  )
                }
              >
                Submit for Final Review
              </Button>
            </Space>
          </Card>
        );
      }
    }
    return null;
  };

  const renderTeamMemberUploader = () => {
    if (user.role === "SUPER_USER" || !task || task.status === "COMPLETED")
      return null;
    if (user.id !== task.assignedToId) return null;
    let uploadType = null;
    if (task.status === "PENDING_ARCHITECT_DESIGN")
      uploadType = "ARCHITECT_DESIGN";
    else if (task.status === "PENDING_ENGINEER_DESIGN")
      uploadType = "ENGINEER_DESIGN";
    else if (task.status === "PENDING_QUANTIFYING") uploadType = "QUOTATION";
    if (!uploadType) return null;
    return (
      <div style={{ marginBottom: token.margin }}>
        <TaskDocumentUploader
          key={`${task.id}-${task.status}`}
          task={task}
          documentType={uploadType}
          onUploadSuccess={fetchTask}
        />
      </div>
    );
  };

  const renderSuperUserActions = () => {
    if (user.role !== "SUPER_USER" || !task) return null;
    const isApproval =
      task.status === "PENDING_DESIGN_APPROVAL" ||
      task.status === "PENDING_FINAL_APPROVAL";
    const isFin =
      task.status === "PENDING_INVOICING" || task.status === "COMPLETED";
    if (!isApproval && !isFin) return null;

    return (
      <Card
        title="Management Actions"
        style={{ marginBottom: token.margin, background: token.colorFillAlter }}
      >
        <Space wrap>
          {isApproval && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={actionLoading}
                style={{ background: token.colorSuccess }}
              >
                Approve Deliverables
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setIsRejectModalVisible(true)}
              >
                Request Revision
              </Button>
            </>
          )}
          {isFin && (
            <Button
              type="primary"
              icon={<DollarCircleOutlined />}
              onClick={() => setIsInvoiceModalOpen(true)}
              style={{ background: token.colorInfo }}
            >
              Generate Quote / Invoice
            </Button>
          )}
        </Space>
      </Card>
    );
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" />
      </div>
    );
  if (!task) return <div>Task not found</div>;

  return (
    <div
      style={{
        padding: isMobile ? token.padding : token.paddingLG,
        maxWidth: 1200,
        margin: "0 auto",
        background: token.colorBgLayout,
      }}
    >
      <div style={{ marginBottom: token.marginLG }}>
        <Space style={{ marginBottom: token.margin }}>
          <Link to="/">
            <Button icon={<ArrowLeftOutlined />}>Back</Button>
          </Link>
          <Button icon={<ReloadOutlined />} onClick={fetchTask}>
            Refresh
          </Button>
        </Space>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Title level={2} style={{ margin: 0 }}>
            {task.title}
          </Title>
          <Tag color={getStatusColor(task.status, token)}>
            {task.status.replace(/_/g, " ")}
          </Tag>
        </div>
      </div>

      {renderWorkflowVisualization()}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title="Workflow Deliverables"
            style={{ marginBottom: token.margin }}
          >
            <WorkflowDeliverables
              docs={task.taskDocuments}
              currentStatus={task.status}
            />
          </Card>

          {renderSuperUserActions()}
          {renderSubmitAction()}
          {renderTeamMemberUploader()}

          <Card
            title="Original Submission"
            style={{ marginBottom: token.margin }}
          >
            <TaskDocumentList documents={task.documents} />
          </Card>
          <Card title="Specifications" bodyStyle={{ padding: 20 }}>
            {task.description}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Assignment" style={{ marginBottom: token.margin }}>
            {task.assignedTo ? (
              <Card size="small" style={{ background: token.colorPrimaryBg }}>
                <Space>
                  <Avatar
                    icon={getRoleIcon(task.assignedTo.role)}
                    style={{ background: token.colorPrimary }}
                  />
                  <div>
                    <Text strong>{task.assignedTo.name}</Text>
                    <br />
                    <Tag color="blue">
                      {getRoleDisplayName(task.assignedTo.role)}
                    </Tag>
                  </div>
                </Space>
              </Card>
            ) : (
              task.status !== "COMPLETED" && (
                <Alert message="Awaiting Assignment" type="error" showIcon />
              )
            )}
            {user.role === "SUPER_USER" && canAssignTask(task) && (
              <Button
                block
                icon={<SwapOutlined />}
                style={{ marginTop: 16 }}
                onClick={handleOpenAssignModal}
              >
                Manage Assignment
              </Button>
            )}
          </Card>
          <Card title="History" bodyStyle={{ padding: 0 }}>
            <TaskAuditLog logs={task.auditLogs} />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Reject Deliverables"
        open={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        confirmLoading={actionLoading}
      >
        <TextArea
          rows={4}
          placeholder="Reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
      {task && (
        <AssignTaskModal
          task={task}
          open={isAssignModalOpen}
          onCancel={handleAssignModalClose}
          onTaskAssigned={handleTaskAssignedOrReassigned}
          expectedRoles={getExpectedRoleForAssignment(task.status)}
        />
      )}
      {task && isInvoiceModalOpen && (
        <InvoiceGeneratorModal
          referenceId={taskId}
          referenceType="INFRASTRUCTURE"
          onClose={() => {
            handleCloseInvoiceModal();
            fetchTask();
          }}
          initialClient={{
            name: task.submission?.contactName || "",
            email: task.submission?.contactInfo || "",
          }}
        />
      )}
    </div>
  );
};

export default TaskDetailPage;
