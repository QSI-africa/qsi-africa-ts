import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Tabs,
  Tag,
  message,
  Avatar,
  Divider
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

const { Title, Text, Paragraph } = Typography;

const ProfilePage = () => {
  const { user, refetchUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        phone: user.phone || "",
        location: user.location || "",
        organization: user.organization || ""
      });
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (values) => {
    setProfileLoading(true);
    try {
      await api.put("/auth/profile", values);
      message.success("Profile updated successfully.");
      await refetchUser();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to update profile.";
      message.error(errMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    setPasswordLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success("Password changed successfully.");
      passwordForm.resetFields();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to change password.";
      message.error(errMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    message.info("Logged out successfully.");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div style={{ padding: "24px" }}>
      {/* Header Profile Summary */}
      <Card
        bordered={false}
        style={{
          marginBottom: "24px",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "16px"
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={4} style={{ display: "flex", justifyContent: "center" }}>
            <Avatar
              size={96}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#1890ff",
                boxShadow: "0 8px 16px rgba(24, 144, 255, 0.3)"
              }}
            />
          </Col>
          <Col xs={24} sm={14} style={{ textAlign: { xs: "center", sm: "left" } }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-start" } }}>
              <Title level={2} style={{ margin: 0, color: "white" }}>
                {user.name}
              </Title>
              <Tag color="blue" style={{ textTransform: "uppercase", fontWeight: "bold" }}>
                {user.role}
              </Tag>
            </div>
            <Paragraph style={{ color: "rgba(255,255,255,0.65)", margin: "8px 0 0 0" }}>
              <MailOutlined style={{ marginRight: "8px" }} />
              {user.email}
            </Paragraph>
          </Col>
          <Col xs={24} sm={6} style={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" } }}>
            <Button
              danger
              type="primary"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ borderRadius: "16px" }}>
            <Tabs
              defaultActiveKey="profile"
              items={[
                {
                  key: "profile",
                  label: "Edit Profile",
                  children: (
                    <Form
                      form={profileForm}
                      layout="vertical"
                      requiredMark={false}
                      onFinish={handleProfileSubmit}
                      style={{ marginTop: "16px" }}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: "Please enter your name" }]}
                          >
                            <Input prefix={<UserOutlined />} placeholder="Admin Name" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Phone Number" name="phone">
                            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item label="Location" name="location">
                            <Input prefix={<EnvironmentOutlined />} placeholder="Location" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Organization" name="organization">
                            <Input prefix={<SafetyCertificateOutlined />} placeholder="Organization" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item style={{ margin: "16px 0 0 0", textAlign: "right" }}>
                        <Button type="primary" htmlType="submit" loading={profileLoading}>
                          Save Profile Changes
                        </Button>
                      </Form.Item>
                    </Form>
                  )
                },
                {
                  key: "password",
                  label: "Security & Credentials",
                  children: (
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      requiredMark={false}
                      onFinish={handlePasswordSubmit}
                      style={{ marginTop: "16px" }}
                    >
                      <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: "Please input current password" }]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
                      </Form.Item>

                      <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                          { required: true, message: "Please input new password" },
                          { min: 6, message: "Password must be at least 6 characters" }
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="New password" />
                      </Form.Item>

                      <Form.Item
                        label="Confirm New Password"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                          { required: true, message: "Please confirm your password" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("Passwords do not match"));
                            }
                          })
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
                      </Form.Item>

                      <Form.Item style={{ margin: "16px 0 0 0", textAlign: "right" }}>
                        <Button type="primary" htmlType="submit" loading={passwordLoading}>
                          Update Password
                        </Button>
                      </Form.Item>
                    </Form>
                  )
                }
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="System Authority"
            bordered={false}
            style={{ borderRadius: "16px", height: "100%" }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Role Permission Scope
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <SafetyCertificateOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                  <Text strong>{user.role}</Text>
                </div>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Registry UUID
                </Text>
                <div style={{ marginTop: "4px" }}>
                  <Text code copyable style={{ fontSize: "11px" }}>
                    {user.id}
                  </Text>
                </div>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Authority Integrity
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Text style={{ color: "#52c41a" }}>Authorized & Synchronized</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
