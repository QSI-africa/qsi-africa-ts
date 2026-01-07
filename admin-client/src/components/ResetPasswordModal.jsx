// admin-client/src/components/ResetPasswordModal.jsx
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  App as AntApp,
  Typography,
  Space,
  Card,
  theme,
} from "antd";
import {
  KeyOutlined,
  LockOutlined,
  UserOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import api from "../api";

const { Text, Title } = Typography;
const { useToken } = theme;

const ResetPasswordModal = ({ user, open, onCancel, onPasswordReset }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = AntApp.useApp();
  const { token } = useToken();

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}/reset-password`, {
        newPassword: values.newPassword,
      });
      message.success(`Password for ${user.name} reset successfully!`);
      onPasswordReset();
      form.resetFields();
    } catch (error) {
      console.error("Reset password error:", error);
      let errorMessage = "Failed to reset password.";
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
            <KeyOutlined
              style={{ marginRight: token.marginSM, color: token.colorWarning }}
            />
            Reset User Password
          </Title>
          <Text
            style={{
              color: token.colorTextSecondary,
              fontSize: token.fontSizeSM,
            }}
          >
            Set a new temporary password for the user
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
      {/* User Information */}
      {user && (
        <Card
          size="small"
          style={{
            background: token.colorWarningBg,
            border: `1px solid ${token.colorWarningBorder}`,
            borderRadius: token.borderRadius,
            marginBottom: token.marginLG,
          }}
          bodyStyle={{ padding: token.padding }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Space>
              <UserOutlined style={{ color: token.colorWarningText }} />
              <Text strong style={{ color: token.colorWarningText }}>
                {user.name}
              </Text>
            </Space>
            <Space>
              <SecurityScanOutlined
                style={{ color: token.colorWarningText, opacity: 0.8 }}
              />
              <Text
                style={{
                  color: token.colorWarningText,
                  fontSize: token.fontSizeSM,
                  opacity: 0.9,
                }}
              >
                User will be prompted to change password on next login
              </Text>
            </Space>
          </Space>
        </Card>
      )}

      {/* Security Notice */}
      <Card
        size="small"
        style={{
          background: token.colorFillTertiary,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          marginBottom: token.marginLG,
        }}
        bodyStyle={{ padding: token.paddingSM }}
      >
        <Text
          style={{
            color: token.colorTextSecondary,
            fontSize: token.fontSizeSM,
          }}
        >
          <SecurityScanOutlined
            style={{
              marginRight: token.marginXS,
              color: token.colorTextTertiary,
            }}
          />
          Enter a new temporary password. The user will be required to change it
          upon their next login.
        </Text>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleResetPassword}
        style={{ marginTop: token.margin }}
      >
        <Form.Item
          name="newPassword"
          label={
            <Text style={{ color: token.colorText, fontWeight: 500 }}>
              <LockOutlined
                style={{
                  marginRight: token.marginXS,
                  color: token.colorTextTertiary,
                }}
              />
              New Temporary Password
            </Text>
          }
          rules={[
            { required: true, message: "Please input the new password!" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
          extra={
            <Text
              style={{
                color: token.colorTextTertiary,
                fontSize: token.fontSizeSM,
              }}
            >
              Minimum 6 characters. This will be a temporary password.
            </Text>
          }
        >
          <Input.Password
            placeholder="Enter new temporary password"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              color: token.colorText,
              borderRadius: token.borderRadius,
            }}
          />
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
                background: token.colorWarning,
                borderColor: token.colorWarning,
                borderRadius: token.borderRadius,
                fontWeight: 600,
              }}
            >
              Reset Password
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Enhanced Custom Styles */}
      <style>
        {`
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

          .ant-input::placeholder {
            color: ${token.colorTextTertiary} !important;
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

          .ant-btn-primary {
            background: ${token.colorWarning} !important;
            border-color: ${token.colorWarning} !important;
          }

          .ant-btn-primary:hover {
            background: ${token.colorWarningHover} !important;
            border-color: ${token.colorWarningHover} !important;
          }

          .ant-btn-primary:active {
            background: ${token.colorWarningActive} !important;
            border-color: ${token.colorWarningActive} !important;
          }
        `}
      </style>
    </Modal>
  );
};

export default ResetPasswordModal;
