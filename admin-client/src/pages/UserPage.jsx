// admin-client/src/pages/UserPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Typography,
  App as AntApp,
  Space,
  Popconfirm,
  Tag,
  Card,
  theme,
  Grid,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";
import ResetPasswordModal from "../components/ResetPasswordModal";

const { useToken } = theme;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user: currentUser } = useAuth();
  const { message } = AntApp.useApp();
  const { token } = useToken();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      if (error.response?.status !== 401) {
        message.error(error.response?.data?.error || "Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      message.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      if (error.response?.status !== 401) {
        message.error(error.response?.data?.error || "Failed to delete user.");
      }
    }
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const openResetModal = (user) => {
    setSelectedUser(user);
    setIsResetModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsResetModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const getRoleColor = (role) => {
    const colorMap = {
      SUPER_USER: token.colorError,
      ADMIN: token.colorWarning,
      ENGINEER: token.colorInfo,
      ARCHITECT: token.colorSuccess,
      QUANTITY_SURVEYOR: token.colorPrimary,
    };
    return colorMap[role] || token.colorTextTertiary;
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Text
          style={{
            color: token.colorTextSecondary,
            fontSize: token.fontSize,
          }}
        >
          {email}
        </Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={getRoleColor(role)}
          style={{
            borderRadius: token.borderRadiusSM,
            border: "none",
            color: token.colorTextLightSolid,
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {role.replace(/_/g, " ").toLowerCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
            style={{
              background: token.colorPrimaryBg,
              border: `1px solid ${token.colorPrimaryBorder}`,
              color: token.colorPrimaryText,
              borderRadius: token.borderRadius,
              fontWeight: 500,
            }}
          >
            Edit
          </Button>
          {record.role !== "SUPER_USER" && (
            <Button
              icon={<KeyOutlined />}
              onClick={() => openResetModal(record)}
              size="small"
              style={{
                background: token.colorWarningBg,
                border: `1px solid ${token.colorWarningBorder}`,
                color: token.colorWarningText,
                borderRadius: token.borderRadius,
                fontWeight: 500,
              }}
            >
              Reset Password
            </Button>
          )}
          {currentUser.id !== record.id && (
            <Popconfirm
              title="Delete this user?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Delete"
              cancelText="No"
              okButtonProps={{
                danger: true,
                style: {
                  background: token.colorError,
                  borderColor: token.colorError,
                  fontWeight: 500,
                },
              }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                style={{
                  fontWeight: 500,
                }}
              >
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Calculate user statistics
  const totalUsers = users.length;
  const superUsers = users.filter((user) => user.role === "SUPER_USER").length;
  const admins = users.filter((user) => user.role === "ADMIN").length;
  const teamMembers = users.filter((user) =>
    ["ENGINEER", "ARCHITECT", "QUANTITY_SURVEYOR"].includes(user.role)
  ).length;

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
                User Management
              </Title>
              <Paragraph
                style={{
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeLG,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Manage system users and their permissions
              </Paragraph>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddModal}
                style={{
                  background: token.colorPrimary,
                  borderColor: token.colorPrimary,
                  borderRadius: token.borderRadius,
                  fontWeight: 600,
                }}
              >
                Add New User
              </Button>
            </Space>
          </div>

          {/* Stats Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(200px, 1fr))",
              gap: token.margin,
              marginBottom: token.marginSM,
            }}
          >
            <Card
              style={{
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
              }}
              hoverable
              bodyStyle={{ padding: token.paddingLG }}
            >
              <div style={{ textAlign: "center" }}>
                <TeamOutlined
                  style={{
                    color: token.colorPrimary,
                    fontSize: "24px",
                    marginBottom: token.marginSM,
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
                  Total Users
                </Text>
                <Text
                  style={{
                    color: token.colorPrimary,
                    fontSize: "28px",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  {totalUsers}
                </Text>
              </div>
            </Card>

            <Card
              style={{
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
              }}
              bodyStyle={{ padding: token.paddingLG }}
            >
              <div style={{ textAlign: "center" }}>
                <UserOutlined
                  style={{
                    color: token.colorError,
                    fontSize: "24px",
                    marginBottom: token.marginSM,
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
                  Super Users
                </Text>
                <Text
                  style={{
                    color: token.colorError,
                    fontSize: "28px",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  {superUsers}
                </Text>
              </div>
            </Card>

            <Card
              style={{
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
              }}
              bodyStyle={{ padding: token.paddingLG }}
            >
              <div style={{ textAlign: "center" }}>
                <UserOutlined
                  style={{
                    color: token.colorWarning,
                    fontSize: "24px",
                    marginBottom: token.marginSM,
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
                  Admins
                </Text>
                <Text
                  style={{
                    color: token.colorWarning,
                    fontSize: "28px",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  {admins}
                </Text>
              </div>
            </Card>

            <Card
              style={{
                background: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
              }}
              bodyStyle={{ padding: token.paddingLG }}
            >
              <div style={{ textAlign: "center" }}>
                <TeamOutlined
                  style={{
                    color: token.colorSuccess,
                    fontSize: "24px",
                    marginBottom: token.marginSM,
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
                  Team Members
                </Text>
                <Text
                  style={{
                    color: token.colorSuccess,
                    fontSize: "28px",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  {teamMembers}
                </Text>
              </div>
            </Card>
          </div>
        </div>

        {/* Users Table */}
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
            size= "small"
            columns={columns}
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
            scroll={isMobile ? { x: 800 } : {}}
          />
        </Card>
      </div>

      {/* Modals */}
      <AddUserModal
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onUserAdded={handleModalClose}
      />

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleModalClose}
        />
      )}

      {selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          open={isResetModalOpen}
          onCancel={() => {
            setIsResetModalOpen(false);
            setSelectedUser(null);
          }}
          onPasswordReset={handleModalClose}
        />
      )}

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

          /* Popconfirm Styling */
          .ant-popconfirm .ant-popconfirm-message {
            color: ${token.colorText} !important;
          }

          .ant-popconfirm .ant-popconfirm-description {
            color: ${token.colorTextSecondary} !important;
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

export default UserPage;
