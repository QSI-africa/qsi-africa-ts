// client/src/pages/RegisterPage.jsx
import React, { useState  } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  App as AntApp,
  Alert,
} from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { message } = AntApp.useApp();
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      await register(values.name, values.email, values.password);
      message.success("Registration Successful!");
      navigate("/onboarding", { replace: true });
    } catch (err) {
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
