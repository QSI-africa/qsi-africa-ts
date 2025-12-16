import React, { useState, useEffect  } from 'react';
import {
  Table,
  Tag,
  Button,
  Typography,
  App as AntApp,
  Card,
  Space,
  Input,
  theme,
  Grid,
  Tooltip,
  Badge,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserAddOutlined,
  PaperClipOutlined,
  BuildOutlined,
  ApartmentOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import AssignTaskModal from "../components/AssignTaskModal";

const { useToken } = theme;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

// Updated status color mapping based on new logic
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

// Helper to determine which statuses are assignable
const isAssignableStatus = (status) => {
  const assignableStates = [
    "PENDING_ASSIGNMENT",
    "PENDING_ARCHITECT_DESIGN",
    "PENDING_ENGINEER_DESIGN",
    "PENDING_QUANTIFYING",
  ];
  return assignableStates.includes(status);
};

// Get icon for status based on role
const getStatusIcon = (status) => {
  switch (status) {
    case "PENDING_ARCHITECT_DESIGN":
      return <ApartmentOutlined />;
    case "PENDING_ENGINEER_DESIGN":
      return <BuildOutlined />;
    case "PENDING_QUANTIFYING":
      return <CalculatorOutlined />;
    default:
      return null;
  }
};

// Get status display text with role context
const getStatusDisplay = (status, assignedToRole) => {
  const baseText = status.replace(/_/g, " ");
  
  // Add role context for clarity
  if (status === "PENDING_ARCHITECT_DESIGN") {
    return "Architect Design";
  } else if (status === "PENDING_ENGINEER_DESIGN") {
    return "Engineer Design";
  } else if (status === "PENDING_QUANTIFYING") {
    return assignedToRole === "ENGINEER" ? "Engineer Quantifying" : "QS Quantifying";
  }
  
  return baseText;
};

// Updated pending statuses for stats
const PENDING_STATUSES = [
  "PENDING_ARCHITECT_DESIGN",
  "PENDING_ENGINEER_DESIGN",
  "PENDING_QUANTIFYING",
  "PENDING_DESIGN_APPROVAL",
  "PENDING_FINAL_APPROVAL",
];

// Get next expected role for assignment
const getExpectedRolesForStatus = (status) => {
  switch (status) {
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

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchText, setSearchText] = useState<string>("");
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const { token } = useToken();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      if (error.response?.status !== 401) {
        message.error("Failed to load tasks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isSuperUser = user?.role === "SUPER_USER";
  
  const handleView = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleAssignClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskAssigned = () => {
    handleModalClose();
    fetchData();
  };

  let filteredTasks = tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.status?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.assignedTo?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (!isSuperUser) {
    filteredTasks = filteredTasks.filter(
      (task) => task.assignedToId === user?.id
    );
  }

  const columns = [
    {
      title: "Task Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <Text
          style={{
            color: token.colorText,
            fontWeight: 500,
            fontSize: token.fontSize,
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "File",
      key: "attachment",
      width: 100,
      render: (_, record) => {
        const document = record.submission?.document;

        if (document) {
          let apiBase =
            import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";

          // Safely extract the root URL
          let rootUrl;
          try {
            const urlObj = new URL(apiBase);
            rootUrl = urlObj.origin; // always gives: https://domain.com
          } catch {
            // fallback
            rootUrl = apiBase.replace("/api", "");
          }

          const fileUrl = `${rootUrl}/uploads/${document.fileName}`;

          return (
            <Tooltip
              title={`Download: ${document.originalName} (${formatFileSize(
                document.fileSize
              )})`}
            >
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Tag icon={<PaperClipOutlined />} color="blue">
                  View File
                </Tag>
              </a>
            </Tooltip>
          );
        }

        return <span>No File</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const statusIcon = getStatusIcon(status);
        const displayText = getStatusDisplay(status, record.assignedTo?.role);
        const expectedRoles = getExpectedRolesForStatus(status);
        
        const statusTooltip = isAssignableStatus(status) && isSuperUser
          ? `Expected next role: ${expectedRoles.join(" or ")}`
          : record.assignedTo?.role
          ? `Assigned to ${record.assignedTo.name} (${record.assignedTo.role})`
          : "Awaiting assignment";

        return (
          <Tooltip title={statusTooltip}>
            <Badge
              status={
                status.includes("PENDING") ? "processing" :
                status === "COMPLETED" ? "success" :
                status === "REJECTED" ? "error" : "default"
              }
              text={
                <Tag
                  color={getStatusColor(status, token)}
                  style={{
                    borderRadius: token.borderRadiusSM,
                    padding: "4px 12px",
                    fontSize: token.fontSizeSM,
                    fontWeight: 500,
                    border: "none",
                    color: token.colorTextLightSolid,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {statusIcon && <span>{statusIcon}</span>}
                  {displayText}
                </Tag>
              }
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Submitted On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <Text
          style={{
            color: token.colorTextSecondary,
            fontSize: token.fontSizeSM,
          }}
        >
          {new Date(text).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: ["assignedTo", "name"],
      key: "assignedTo",
      render: (name, record) => {
        const role = record.assignedTo?.role;
        const roleIcon = role ? getStatusIcon(`PENDING_${role.toUpperCase()}_DESIGN`) : null;
        
        return (
          <Space align="center" size="small">
            {roleIcon && <span style={{ color: token.colorTextTertiary }}>{roleIcon}</span>}
            <Text
              style={{
                color: name ? token.colorText : token.colorTextTertiary,
                fontStyle: name ? "normal" : "italic",
                fontSize: token.fontSizeSM,
              }}
            >
              {name || "Unassigned"}
            </Text>
            {role && (
              <Tag
                color="default"
                style={{
                  fontSize: token.fontSizeXS,
                  padding: "0 6px",
                  borderRadius: token.borderRadiusSM,
                }}
              >
                {role}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const canAssign = isSuperUser && isAssignableStatus(record.status);
        const expectedRoles = getExpectedRolesForStatus(record.status);
        
        return (
          <Space size="small">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
              size="small"
              style={{
                background: token.colorPrimaryBg,
                border: `1px solid ${token.colorPrimaryBorder}`,
                color: token.colorPrimaryText,
                borderRadius: token.borderRadius,
                fontWeight: 500,
              }}
            >
              View
            </Button>
            {canAssign && (
              <Tooltip title={`Assign to ${expectedRoles.join(" or ")}`}>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => handleAssignClick(record)}
                  size="small"
                  style={{
                    background: token.colorPrimary,
                    borderColor: token.colorPrimary,
                    borderRadius: token.borderRadius,
                    fontWeight: 500,
                  }}
                >
                  {record.assignedToId ? "Reassign" : "Assign"}
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Updated Stats Calculation based on new logic
  const pendingAssignedToMe = tasks.filter(
    (task) =>
      task.assignedToId === user?.id && PENDING_STATUSES.includes(task.status)
  ).length;

  // Count tasks in different stages
  const architectDesignTasks = tasks.filter(
    (t) => t.status === "PENDING_ARCHITECT_DESIGN"
  ).length;

  const engineerDesignTasks = tasks.filter(
    (t) => t.status === "PENDING_ENGINEER_DESIGN"
  ).length;

  const quantifyingTasks = tasks.filter(
    (t) => t.status === "PENDING_QUANTIFYING"
  ).length;

  const inProgressTasks = architectDesignTasks + engineerDesignTasks + quantifyingTasks;

  const statsData = [
    {
      label: "Total Tasks",
      value: tasks.length,
      color: token.colorPrimary,
      icon: "📊",
      tooltip: "All tasks in the system",
    },
    {
      label: "Assigned to Me",
      value: pendingAssignedToMe,
      color: token.colorWarning,
      icon: "👤",
      tooltip: "Tasks currently assigned to you",
    },
    {
      label: "Pending Assignment",
      value: tasks.filter((t) => t.status === "PENDING_ASSIGNMENT").length,
      color: token.colorError,
      icon: "⏳",
      tooltip: "Tasks waiting for initial assignment",
    },
    {
      label: "Architect Design",
      value: architectDesignTasks,
      color: token.colorOrange,
      icon: <ApartmentOutlined />,
      tooltip: "Tasks with architects working on designs",
    },
    {
      label: "Engineer Design",
      value: engineerDesignTasks,
      color: token.colorBlue,
      icon: <BuildOutlined />,
      tooltip: "Tasks with engineers working on designs",
    },
    {
      label: "Quantifying",
      value: quantifyingTasks,
      color: token.colorInfo,
      icon: <CalculatorOutlined />,
      tooltip: "Tasks being quantified by QS/Engineers",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      color: token.colorProcessing,
      icon: "🚀",
      tooltip: "Total tasks currently being worked on",
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "COMPLETED").length,
      color: token.colorSuccess,
      icon: "✅",
      tooltip: "Successfully completed tasks",
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      {/* Background Elements */}
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
          opacity: 0.6,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorPrimary}15 0%, transparent 70%)`,
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
            background: `radial-gradient(circle, ${token.colorInfo}10 0%, transparent 70%)`,
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
          <Title
            level={4}
            style={{
              color: token.colorTextHeading,
              marginBottom: token.marginXS,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Task Dashboard
          </Title>
          <Paragraph
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeLG,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Monitor and manage all infrastructure tasks in one place
          </Paragraph>
        </div>

        {/* Stats Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit, minmax(200px, 1fr))",
            gap: token.margin,
            marginBottom: token.marginLG,
          }}
        >
          {statsData.map((stat, index) => (
            <Tooltip key={index} title={stat.tooltip}>
              <Card
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                  transition: `all ${token.motionDurationMid} ${token.motionEaseOut}`,
                  cursor: "pointer",
                }}
                bodyStyle={{
                  padding: isMobile ? token.padding : token.paddingLG,
                }}
                hoverable
                onClick={() => {
                  if (stat.label === "Architect Design") {
                    setSearchText("PENDING_ARCHITECT_DESIGN");
                  } else if (stat.label === "Engineer Design") {
                    setSearchText("PENDING_ENGINEER_DESIGN");
                  } else if (stat.label === "Quantifying") {
                    setSearchText("PENDING_QUANTIFYING");
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: token.marginSM,
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      opacity: 0.8,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {typeof stat.icon === 'string' ? stat.icon : stat.icon}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: token.marginXS,
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: token.colorTextTertiary,
                        fontSize: token.fontSizeSM,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text
                      style={{
                        color: stat.color,
                        fontSize: isMobile ? "28px" : "32px",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </Text>
                  </div>
                </div>
              </Card>
            </Tooltip>
          ))}
        </div>

        {/* Search and Actions Section */}
        <Card
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            marginBottom: token.margin,
            boxShadow: token.boxShadowSecondary,
          }}
          bodyStyle={{
            padding: isMobile ? token.paddingSM : token.padding,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: token.margin,
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
            }}
          >
            <Input
              placeholder="Search tasks by title, status, or assignee..."
              prefix={
                <SearchOutlined style={{ color: token.colorTextTertiary }} />
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                flex: isMobile ? "none" : 1,
                maxWidth: isMobile ? "100%" : "400px",
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                color: token.colorText,
              }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
              style={{
                background: token.colorPrimaryBg,
                border: `1px solid ${token.colorPrimaryBorder}`,
                color: token.colorPrimaryText,
                borderRadius: token.borderRadius,
                fontWeight: 500,
                minWidth: isMobile ? "100%" : "auto",
              }}
            >
              Refresh Data
            </Button>
          </div>
        </Card>

        {/* Tasks Table Section */}
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
            size={isMobile ? "small" : "middle"}
            columns={columns}
            dataSource={filteredTasks}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} tasks`,
              style: {
                padding: token.padding,
                background: token.colorBgContainer,
                margin: 0,
              },
            }}
            scroll={isMobile ? { x: 800 } : {}}
          />
        </Card>
      </div>

      {selectedTask && (
        <AssignTaskModal
          task={selectedTask}
          open={isModalOpen}
          onCancel={handleModalClose}
          onTaskAssigned={handleTaskAssigned}
          expectedRoles={getExpectedRolesForStatus(selectedTask.status)}
        />
      )}

      {/* Styles Block */}
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

          .ant-table {
            background: transparent !important;
          }

          .ant-table-thead > tr > th {
            background: ${token.colorFillTertiary} !important;
            color: ${token.colorText} !important;
            border-bottom: 2px solid ${token.colorBorder} !important;
            font-weight: 600 !important;
            font-size: ${token.fontSizeSM}px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: ${token.paddingSM}px ${token.padding}px !important;
          }

          .ant-table-tbody > tr {
            background: ${token.colorBgContainer} !important;
            transition: all ${token.motionDurationFast} ${token.motionEaseOut} !important;
          }

          .ant-table-tbody > tr:hover > td {
            background: ${token.colorPrimaryBg} !important;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px ${token.colorPrimaryBg}30;
          }

          .ant-table-tbody > tr > td {
            border-bottom: 1px solid ${token.colorBorder} !important;
            color: ${token.colorText} !important;
            padding: ${token.paddingSM}px ${token.padding}px !important;
            transition: all ${token.motionDurationFast} ${token.motionEaseOut} !important;
          }

          /* Pagination and Select Styles */
          .ant-pagination {
            color: ${token.colorText} !important;
            padding: ${token.padding}px !important;
          }

          .ant-pagination-item {
            background: ${token.colorBgContainer} !important;
            border: 1px solid ${token.colorBorder} !important;
            border-radius: ${token.borderRadius}px !important;
          }

          .ant-pagination-item a {
            color: ${token.colorText} !important;
          }

          .ant-pagination-item:hover {
            border-color: ${token.colorPrimary} !important;
          }

          .ant-pagination-item-active {
            background: ${token.colorPrimary} !important;
            border-color: ${token.colorPrimary} !important;
          }

          .ant-pagination-item-active a {
            color: ${token.colorTextLightSolid} !important;
            font-weight: 600;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardPage;