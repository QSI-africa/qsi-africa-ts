// admin-client/src/components/AddUserModal.jsx
import React, { useState  } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  App as AntApp,
  Typography,
  Space,
  theme,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import api from "../api";

const { Option } = Select;
const { Text, Title } = Typography;
const { useToken } = theme;

// Define the roles that can be created
const assignableRoles = [
  "TEAM_MEMBER",
  "ENGINEER",
  "ARCHITECT",
  "QUANTITY_SURVEYOR",
  "SUPER_USER",
  "ADMIN",
];

const getRoleColor = (role, token) => {
  const colorMap = {
    SUPER_USER: token.colorError,
    ADMIN: token.colorWarning,
    ENGINEER: token.colorInfo,
    ARCHITECT: token.colorSuccess,
    QUANTITY_SURVEYOR: token.colorPrimary,
    TEAM_MEMBER: token.colorTextTertiary,
  };
  return colorMap[role] || token.colorTextTertiary;
};

const AddUserModal = ({ open, onCancel, onUserAdded }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { message } = AntApp.useApp();
  const { token } = useToken();

  const handleAddUser = async (values) => {
    setLoading(true);
    try {
      await api.post("/admin/users", {
        email: values.email,
        name: values.name,
        password: values.password,
        role: values.role,
      });
      message.success("User added successfully!");
      onUserAdded();
      form.resetFields();
    } catch (error) {
      console.error("Add user error:", error);
      let errorMessage = "Failed to add user.";
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
            Add New User
          </Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
            }}
          >
            Create a new system user account
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddUser}
        style={{ marginTop: token.margin }}
      >
        {/* Personal Information */}
        <Form.Item
          name="name"
          label={
            <Text style={{ color: token.colorText, fontWeight: 500 }}>
              <UserOutlined
                style={{
                  marginRight: token.marginXS,
                  color: token.colorTextTertiary,
                }}
              />
              Full Name
            </Text>
          }
          rules={[{ required: true, message: "Please input the user's name!" }]}
        >
          <Input
            placeholder="Enter user's full name"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              color: token.colorText,
              borderRadius: token.borderRadius,
            }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <Text style={{ color: token.colorText, fontWeight: 500 }}>
              <MailOutlined
                style={{
                  marginRight: token.marginXS,
                  color: token.colorTextTertiary,
                }}
              />
              Email Address
            </Text>
          }
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input a valid email!",
            },
          ]}
        >
          <Input
            placeholder="Enter email address"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              color: token.colorText,
              borderRadius: token.borderRadius,
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={
            <Text style={{ color: token.colorText, fontWeight: 500 }}>
              <LockOutlined
                style={{
                  marginRight: token.marginXS,
                  color: token.colorTextTertiary,
                }}
              />
              Initial Password
            </Text>
          }
          rules={[
            { required: true, message: "Please input an initial password!" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
          extra={
            <Text
              style={{
                color: token.colorTextTertiary,
                fontSize: token.fontSizeSM,
              }}
            >
              User will be prompted to change password on first login
            </Text>
          }
        >
          <Input.Password
            placeholder="Enter initial password"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              color: token.colorText,
              borderRadius: token.borderRadius,
            }}
          />
        </Form.Item>

        <Form.Item
          name="role"
          label={
            <Text style={{ color: token.colorText, fontWeight: 500 }}>
              <TeamOutlined
                style={{
                  marginRight: token.marginXS,
                  color: token.colorTextTertiary,
                }}
              />
              User Role
            </Text>
          }
          rules={[{ required: true, message: "Please select a role!" }]}
          extra={
            <Text
              style={{
                color: token.colorTextTertiary,
                fontSize: token.fontSizeSM,
              }}
            >
              Determines user permissions and access levels
            </Text>
          }
        >
          <Select
            placeholder="Select user role"
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
            {assignableRoles.map((role) => (
              <Option
                key={role}
                value={role}
                style={{
                  color: token.colorText,
                  background: token.colorBgContainer,
                }}
              >
                <Space>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: getRoleColor(role, token),
                    }}
                  />
                  <Text style={{ color: token.colorText }}>
                    {role.replace(/_/g, " ")}
                  </Text>
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
              Add User
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Enhanced Custom Styles */}
      <style>
        {`
          .ant-input:focus,
          .ant-input-focused {
            border-color: ${token.colorPrimary} !important;
            box-shadow: 0 0 0 2px ${token.colorPrimaryBg} !important;
          }

          .ant-input:hover {
            border-color: ${token.colorPrimaryHover} !important;
          }

          .ant-input::placeholder {
            color: ${token.colorTextTertiary} !important;
          }

          .ant-input-password .ant-input {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          .ant-input-password:focus,
          .ant-input-password-focused {
            border-color: ${token.colorPrimary} !important;
            box-shadow: 0 0 0 2px ${token.colorPrimaryBg} !important;
          }

          .ant-input-password:hover {
            border-color: ${token.colorPrimaryHover} !important;
          }

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

export default AddUserModal;
