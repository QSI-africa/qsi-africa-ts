// client/src/pages/LoginPage.jsx
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
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { message } = AntApp.useApp();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      message.success("Login Successful!");
      navigate(-1); // Redirect to homepage (App.jsx will handle onboarding check)
    } catch (err) {
      console.error("Login Failed:", err);
      setError(
        err.response?.data?.error || "Login failed. Please check credentials."
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
          QSI Platform Login
        </Title>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form name="client_login" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Log In
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            Don't have an account? <Link to="/register">Sign up now</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
export default LoginPage;
