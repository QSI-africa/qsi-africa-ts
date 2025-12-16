// admin-client/src/components/AssignTaskModal.jsx
import React, { useState, useEffect  } from 'react';
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
import { UserOutlined, TeamOutlined, RocketOutlined } from "@ant-design/icons";
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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(false);
  const { message } = AntApp.useApp();
  const { token } = useToken();

  useEffect(() => {
    if (open) {
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
          let errorMessage = "Failed to fetch user list.";
          if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (!error.response) {
            errorMessage = "Network error. Please check your connection.";
          }
          if (error.response?.status !== 401) {
            message.error(errorMessage);
          }
        })
        .finally(() => {
          setFetchingUsers(false);
        });
    }
  }, [open, message]);

  const handleAssign = async (values) => {
    setLoading(true);
    try {
      const { teamMemberId } = values;
      const endpoint = isReassign
        ? `/admin/tasks/${task.id}/reassign`
        : `/admin/tasks/${task.id}/assign`;

      await api.put(endpoint, { teamMemberId });

      message.success(
        `Task ${isReassign ? "reassigned" : "assigned"} successfully!`
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

  return (
    <Modal
      title={
        <div>
          <Title level={4} style={{ color: token.colorTextHeading, margin: 0 }}>
            <RocketOutlined
              style={{ marginRight: token.marginSM, color: token.colorPrimary }}
            />
            {isReassign ? "Reassign Task" : "Assign Task"}
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
            {task.assignedTo && isReassign && (
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
        <Form.Item
          name="teamMemberId"
          label={
            <Text style={{ color: token.colorText, fontWeight: 500 }}>
              <TeamOutlined
                style={{
                  marginRight: token.marginXS,
                  color: token.colorTextTertiary,
                }}
              />
              {isReassign ? "Reassign to Team Member" : "Assign to Team Member"}
            </Text>
          }
          rules={[{ required: true, message: "Please select a team member." }]}
          extra={
            <Text
              style={{
                color: token.colorTextTertiary,
                fontSize: token.fontSizeSM,
              }}
            >
              {isReassign
                ? "Select a new team member to take over this task"
                : "Select a team member to assign this task to"}
            </Text>
          }
        >
          <Select
            placeholder="Select a team member"
            loading={fetchingUsers}
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              color: token.colorText,
              borderRadius: token.borderRadius,
            }}
            dropdownStyle={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
            }}
          >
            {users.map((user) => (
              <Option
                key={user.id}
                value={user.id}
                style={{
                  color: token.colorText,
                  background: token.colorBgContainer,
                }}
              >
                <Space>
                  <UserOutlined style={{ color: token.colorTextTertiary }} />
                  <Text style={{ color: token.colorText, fontWeight: 500 }}>
                    {user.name}
                  </Text>
                  <Tag
                    color={getRoleColor(user.role, token)}
                    style={{
                      borderRadius: token.borderRadiusSM,
                      border: "none",
                      fontSize: token.fontSizeSM,
                      fontWeight: 500,
                      color: token.colorTextLightSolid,
                    }}
                  >
                    {user.role.replace(/_/g, " ")}
                  </Tag>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

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
              style={{
                background: token.colorPrimaryBg,
                border: `1px solid ${token.colorPrimaryBorder}`,
                color: token.colorPrimaryText,
                borderRadius: token.borderRadius,
                fontWeight: 500,
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                background: token.colorPrimary,
                borderColor: token.colorPrimary,
                borderRadius: token.borderRadius,
                fontWeight: 600,
              }}
            >
              {isReassign ? "Reassign Task" : "Assign Task"}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Enhanced Custom Styles */}
      <style>
        {`
          .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
            border-color: ${token.colorPrimaryHover} !important;
          }

          .ant-select-focused .ant-select-selector {
            border-color: ${token.colorPrimary} !important;
            box-shadow: 0 0 0 2px ${token.colorPrimaryBg} !important;
          }

          .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: ${token.colorPrimaryBg} !important;
          }

          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: ${token.colorFillTertiary} !important;
          }

          .ant-form-item-label > label {
            color: ${token.colorText} !important;
          }

          .ant-form-item-extra {
            color: ${token.colorTextTertiary} !important;
          }

          .ant-form-item-explain-error {
            color: ${token.colorError} !important;
          }
        `}
      </style>
    </Modal>
  );
};

export default AssignTaskModal;
