// admin-client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  App as AntApp,
  theme,
  Space,
  Divider,
} from "antd";
import { MailOutlined, LockOutlined, RocketOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
const { useToken } = theme;

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { message } = AntApp.useApp();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { token } = useToken();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Login Successful!");
    } catch (error) {
      console.error("Login Failed:", error);
      message.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: token.colorBgLayout,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Elements */}
      <div
        style={{
          position: "absolute",
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
            left: "10%",
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
            right: "15%",
            animation: "float2 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${token.colorSuccess}08 0%, transparent 70%)`,
            filter: "blur(40px)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "float3 15s ease-in-out infinite",
          }}
        />
      </div>

      {/* Login Card */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Card
          style={{
            width: 420,
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadow,
            padding: 0,
            overflow: "hidden",
          }}
          bodyStyle={{
            padding: token.paddingLG,
          }}
        >
          {/* Header Section */}
          <div style={{ textAlign: "center", marginBottom: token.marginLG }}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div
                style={{
                  background: token.colorPrimaryBg,
                  borderRadius: "50%",
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  border: `2px solid ${token.colorPrimaryBorder}`,
                }}
              >
                <RocketOutlined
                  style={{
                    fontSize: 28,
                    color: token.colorPrimary,
                  }}
                />
              </div>
              <Title
                level={2}
                style={{
                  color: token.colorTextHeading,
                  margin: 0,
                  fontWeight: 600,
                  fontSize: "28px",
                }}
              >
                QSI Admin
              </Title>
              <Paragraph
                style={{
                  color: token.colorTextSecondary,
                  margin: 0,
                  fontSize: token.fontSize,
                  fontWeight: 400,
                }}
              >
                Sign in to your administrator account
              </Paragraph>
            </Space>
          </div>

          <Divider
            style={{
              borderColor: token.colorBorder,
              margin: `${token.margin}px 0`,
            }}
          />

          {/* Login Form */}
          <Form
            name="admin_login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label={
                <Text
                  style={{
                    color: token.colorText,
                    fontWeight: 500,
                    fontSize: token.fontSize,
                  }}
                >
                  Email Address
                </Text>
              }
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input a valid email address!",
                },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined style={{ color: token.colorTextTertiary }} />
                }
                placeholder="Enter your email"
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  color: token.colorText,
                  height: token.controlHeightLG,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <Text
                  style={{
                    color: token.colorText,
                    fontWeight: 500,
                    fontSize: token.fontSize,
                  }}
                >
                  Password
                </Text>
              }
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined style={{ color: token.colorTextTertiary }} />
                }
                placeholder="Enter your password"
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  color: token.colorText,
                  height: token.controlHeightLG,
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  background: token.colorPrimary,
                  borderColor: token.colorPrimary,
                  borderRadius: token.borderRadius,
                  height: token.controlHeightLG,
                  fontWeight: 600,
                  fontSize: token.fontSize,
                  boxShadow: token.boxShadowSecondary,
                  transition: `all ${token.motionDurationMid} ${token.motionEaseOut}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = token.colorPrimaryHover;
                  e.target.style.borderColor = token.colorPrimaryHover;
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = token.boxShadow;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = token.colorPrimary;
                  e.target.style.borderColor = token.colorPrimary;
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = token.boxShadowSecondary;
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div
            style={{
              marginTop: token.marginLG,
              textAlign: "center",
            }}
          >
            <Text
              style={{
                color: token.colorTextTertiary,
                fontSize: token.fontSizeSM,
              }}
            >
              Secure Admin Portal • QSI Systems
            </Text>
          </div>
        </Card>
      </div>

      {/* Custom Styles */}
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

          @keyframes float3 {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            33% { transform: translate(-55%, -45%) scale(1.02); }
            66% { transform: translate(-45%, -55%) scale(0.98); }
          }

          /* Enhanced Form Styling */
          .ant-form-item-label > label {
            color: ${token.colorText} !important;
          }

          .ant-input:focus,
          .ant-input-focused {
            border-color: ${token.colorPrimary} !important;
            box-shadow: 0 0 0 2px ${token.colorPrimaryBg} !important;
          }

          .ant-input:hover {
            border-color: ${token.colorPrimaryHover} !important;
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

          /* Card hover effect */
          .ant-card {
            transition: all ${token.motionDurationMid} ${token.motionEaseOut} !important;
          }

          .ant-card:hover {
            transform: translateY(-2px);
            box-shadow: ${token.boxShadow} !important;
          }

          /* Responsive adjustments */
          @media (max-width: 480px) {
            .ant-card {
              width: 90vw !important;
              margin: 20px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
