// admin-client/src/components/AssignTaskModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  App as AntApp,
  Typography,
  Space,
  Tag,
  theme,
} from "antd";
import { UserOutlined, TeamOutlined, RocketOutlined, ApartmentOutlined, BuildOutlined } from "@ant-design/icons";
import api from "../api";

const { Option } = Select;
const { Text, Title } = Typography;
const { useToken } = theme;

const getRoleColor = (role, token) => {
  const colorMap = {
    ENGINEER: token.colorInfo,
    ARCHITECT: token.colorSuccess,
    QUANTITY_SURVEYOR: token.colorPrimary,
    TEAM_MEMBER: token.colorTextTertiary,
  };
  return colorMap[role] || token.colorTextTertiary;
};

const AssignTaskModal = ({
  task,
  open,
  onCancel,
  onTaskAssigned,
  isReassign = false,
}) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const { message } = AntApp.useApp();
  const { token } = useToken();

  // Fetch users ONLY if reassignment (legacy/specific user required)
  useEffect(() => {
    if (open && isReassign) {
      setFetchingUsers(true);
      api
        .get("/admin/users")
        .then((response) => {
          const assignableUsers = response.data.filter(
            (user) =>
              user.role === "TEAM_MEMBER" ||
              user.role === "ENGINEER" ||
              user.role === "ARCHITECT" ||
              user.role === "QUANTITY_SURVEYOR"
          );
          setUsers(assignableUsers);
        })
        .catch((error) => {
          console.error("Fetch users error:", error);
          message.error("Failed to fetch user list for reassignment.");
        })
        .finally(() => {
          setFetchingUsers(false);
        });
    }
  }, [open, isReassign, message]);

  const handleAssign = async (values) => {
    setLoading(true);
    try {
      if (isReassign) {
         // Re-assignment logic (Individual)
         const { teamMemberId } = values;
         await api.put(`/admin/tasks/${task.id}/reassign`, { teamMemberId });
      } else {
         // Initial Assignment Logic (Role/Department Broadcast)
         const { role } = values;
         await api.put(`/admin/tasks/${task.id}/assign`, { role });
      }

      message.success(
        `Task ${isReassign ? "reassigned" : "broadcasted"} successfully!`
      );
      onTaskAssigned();
      form.resetFields();
    } catch (error) {
      console.error("Assign/Reassign task error:", error);
      let errorMessage = `Failed to ${
        isReassign ? "reassign" : "assign"
      } task.`;
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (!error.response) {
        errorMessage = "Network error. Please check your connection.";
      }
      if (error.response?.status !== 401) {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "ARCHITECT", label: "Architecture Department", icon: <ApartmentOutlined /> },
    { value: "ENGINEER", label: "Engineering Department", icon: <BuildOutlined /> },
  ];

  return (
    <Modal
      title={
        <div>
          <Title level={4} style={{ color: token.colorTextHeading, margin: 0 }}>
            <RocketOutlined
              style={{ marginRight: token.marginSM, color: token.colorPrimary }}
            />
            {isReassign ? "Reassign Task" : "Broadcast Task"}
          </Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
            }}
          >
            {task?.title}
          </Text>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      styles={{
        content: {
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
        },
        header: {
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          padding: token.paddingLG,
        },
        body: {
          color: token.colorText,
          padding: `${token.paddingLG}px ${token.paddingLG}px 0`,
        },
      }}
    >
      {/* Task Information */}
      {task && (
        <div
          style={{
            background: token.colorFillTertiary,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: token.padding,
            marginBottom: token.marginLG,
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text
              strong
              style={{ color: token.colorText, fontSize: token.fontSize }}
            >
              Task Details
            </Text>
            <Space wrap>
              <Text
                style={{
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeSM,
                }}
              >
                Status:
              </Text>
              <Tag
                color={token.colorPrimary}
                style={{
                  borderRadius: token.borderRadiusSM,
                  border: "none",
                  fontSize: token.fontSizeSM,
                  fontWeight: 500,
                }}
              >
                {task.status?.replace(/_/g, " ")}
              </Tag>
            </Space>
             {/* Show current assignee only if assigned */}
            {task.assignedTo && (
              <Space wrap>
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeSM,
                  }}
                >
                  Currently assigned to:
                </Text>
                <Text
                  strong
                  style={{ color: token.colorText, fontSize: token.fontSizeSM }}
                >
                  {task.assignedTo.name}
                </Text>
              </Space>
            )}
          </Space>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleAssign}
        style={{ marginTop: token.margin }}
      >
        {isReassign ? (
            // Legacy/Specific User Re-assignment
            <Form.Item
              name="teamMemberId"
              label="Select Team Member"
              rules={[{ required: true, message: "Please select a team member." }]}
            >
              <Select
                placeholder="Select user"
                loading={fetchingUsers}
                optionLabelProp="label"
              >
                {users.map((user) => (
                  <Option
                    key={user.id}
                    value={user.id}
                    label={user.name}
                  >
                    <Space>
                        <UserOutlined />
                        {user.name}
                        <Tag>{user.role}</Tag>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
        ) : (
            // Role-Based Assignment (Broadcast)
            <Form.Item
              name="role"
              label="Select Department / Role"
              rules={[{ required: true, message: "Please select a department." }]}
              extra="This task will be visible to all members of the selected department."
            >
              <Select placeholder="Select department">
                  {roleOptions.map(opt => (
                      <Option key={opt.value} value={opt.value}>
                          <Space>
                              {opt.icon}
                              {opt.label}
                          </Space>
                      </Option>
                  ))}
              </Select>
            </Form.Item>
        )}

        {/* Form Actions */}
        <Form.Item
          style={{
            textAlign: "right",
            marginBottom: 0,
            paddingTop: token.padding,
            borderTop: `1px solid ${token.colorBorder}`,
          }}
        >
          <Space>
            <Button
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {isReassign ? "Reassign User" : "Broadcast to Department"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignTaskModal;
