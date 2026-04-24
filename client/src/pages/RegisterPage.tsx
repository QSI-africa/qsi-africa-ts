// client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  App as AntApp,
  Alert,
  Checkbox,
} from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { message } = AntApp.useApp();
  const { register } = useAuth()!;
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      await register(values.name, values.email, values.password, values.phone);
      message.success("Registration Successful!");
      // Redirect to intended destination or onboarding
      const from = location.state?.from?.pathname || "/onboarding";
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Registration Failed:", err);
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
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
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Create Your Account
        </Title>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form name="client_register" onFinish={onFinish}>
          <Form.Item name="name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password (min. 6 characters)"
            />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[
              {
                pattern: /^[+]?[\d\s\-()]+$/,
                message: "Please enter a valid phone number"
              }
            ]}
          >
            <Input placeholder="Phone Number (optional)" />
          </Form.Item>
          <Form.Item name="location">
            <Input placeholder="Location/City (optional)" />
          </Form.Item>
          <Form.Item name="organization">
            <Input placeholder="Organization/Company (optional)" />
          </Form.Item>
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Please accept the terms and conditions")),
              },
            ]}
          >
            <Checkbox>
              I agree to the <Link to="/terms">terms and conditions</Link>
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
export default RegisterPage;
