import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  App as AntApp,
  Alert,
  Checkbox,
  Row,
  Col,
} from "antd";
import { UserOutlined, MailOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authHero from "../assets/auth-hero.png";

const { Title, Text, Paragraph } = Typography;

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas-white)' }}>
      {/* Left Side: Visual Hero */}
      <div 
        style={{ 
          flex: 1, 
          position: 'relative', 
          display: 'none', 
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
          <span className="eyebrow" style={{ color: 'white', opacity: 0.9 }}>Join the Network</span>
          <Title level={1} style={{ color: 'white', fontSize: '64px', margin: '20px 0', textTransform: 'uppercase' }}>
            Collaborate <br /> on Sovereignty.
          </Title>
          <div className="grid-border-t grid-border-emerald" style={{ width: '100px', margin: '24px 0' }} />
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div 
        style={{ 
          flex: '0 0 100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 8%',
          '@media (min-width: 992px)': { flex: '0 0 600px', maxWidth: '600px' }
        } as any}
      >
        <div style={{ maxWidth: '500px', width: '100%', margin: '40px auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <span className="eyebrow">Start Your Journey</span>
            <Title level={2} style={{ textTransform: 'uppercase', marginBottom: '16px' }}>CREATE ACCOUNT</Title>
            <Paragraph style={{ color: 'var(--ash-grey)', fontSize: '16px' }}>
              Join the architects of African infrastructure and unlock exclusive collaboration tools.
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
            name="register" 
            onFinish={onFinish} 
            layout="vertical"
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="name" 
                  label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Full Name</span>}
                  rules={[{ required: true }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
                    placeholder="Kwame Mensah" 
                    style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="email" 
                  label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Email Address</span>}
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input 
                    prefix={<MailOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
                    placeholder="kwame@qsi.africa" 
                    style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="password" 
              label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Secure Password</span>}
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
                placeholder="•••••••• (min 6 chars)" 
                style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="phone"
                  label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Phone (Optional)</span>}
                  rules={[{ pattern: /^[+]?[\d\s\-()]+$/, message: "Invalid phone number" }]}
                >
                  <Input 
                    placeholder="+233 24 XXX XXXX" 
                    style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="organization"
                  label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Organization</span>}
                >
                  <Input 
                    placeholder="QSI Innovations" 
                    style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Please accept the terms")),
                },
              ]}
            >
              <Checkbox style={{ fontFamily: 'var(--font-accent)', fontSize: '11px', textTransform: 'uppercase' }}>
                I agree to the <Link to="/terms" style={{ color: 'var(--baobab-emerald)' }}>terms and conditions</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginTop: '24px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                className="afro-button primary"
                style={{ height: '64px', fontSize: '16px' }}
                icon={<ArrowRightOutlined />}
              >
                CREATE ACCOUNT
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Text style={{ color: 'var(--ash-grey)' }}>Already have an account?</Text>
              <Link 
                to="/login" 
                style={{ marginLeft: '8px', color: 'var(--baobab-emerald)', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', fontFamily: 'var(--font-accent)' }}
              >
                Log In
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

export default RegisterPage;
