import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  App as AntApp,
  Alert,
  Space,
} from "antd";
import { MailOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authHero from "../assets/auth-hero.png";

const { Title, Text, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { message } = AntApp.useApp();
  const { login } = useAuth()!;
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      message.success("Login Successful!");
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login Failed:", err);
      setError(
        err.response?.data?.error || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas-white)' }}>
      {/* Left Side: Visual Hero */}
      <div 
        style={{ 
          flex: 1, 
          position: 'relative', 
          display: 'none', // Hidden on mobile
          '@media (min-width: 992px)': { display: 'block' } 
        } as any}
        className="hide-mobile"
      >
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${authHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)',
            zIndex: 1
          }}
        />
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '80px', 
            left: '80px', 
            zIndex: 2,
            maxWidth: '600px'
          }}
        >
          <span className="eyebrow" style={{ color: 'white', opacity: 0.9 }}>Infrastructure of Sovereignty</span>
          <Title level={1} style={{ color: 'white', fontSize: '64px', margin: '20px 0', textTransform: 'uppercase' }}>
            The Future <br /> is Built Here.
          </Title>
          <div className="grid-border-t grid-border-emerald" style={{ width: '100px', margin: '24px 0' }} />
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div 
        style={{ 
          flex: '0 0 100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 10%',
          '@media (min-width: 992px)': { flex: '0 0 500px', maxWidth: '500px' }
        } as any}
      >
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <span className="eyebrow">Welcome Back</span>
            <Title level={2} style={{ textTransform: 'uppercase', marginBottom: '16px' }}>LOG IN</Title>
            <Paragraph style={{ color: 'var(--ash-grey)', fontSize: '16px' }}>
              Access the QSI platform to manage your infrastructure requests and collaborations.
            </Paragraph>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24, borderRadius: 0, border: '2px solid var(--terracotta-clay)' }}
            />
          )}

          <Form 
            name="login" 
            onFinish={onFinish} 
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item 
              name="email" 
              label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Email Address</span>}
              rules={[{ required: true, type: "email" }]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
                placeholder="architect@qsi.africa" 
                style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
              />
            </Form.Item>

            <Form.Item 
              name="password" 
              label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Secure Password</span>}
              rules={[{ required: true }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
                placeholder="••••••••" 
                style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: '32px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                className="afro-button primary"
                style={{ height: '64px', fontSize: '16px' }}
                icon={<ArrowRightOutlined />}
              >
                ACCESS PLATFORM
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", marginTop: '24px' }}>
              <Text style={{ color: 'var(--ash-grey)' }}>New to the platform?</Text>
              <Link 
                to="/register" 
                state={{ from: location.state?.from }}
                style={{ marginLeft: '8px', color: 'var(--baobab-emerald)', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', fontFamily: 'var(--font-accent)' }}
              >
                Create Account
              </Link>
            </div>
          </Form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 991px) {
          .hide-mobile { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default LoginPage;
