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
  Select,
  InputNumber,
  Steps
} from "antd";
import { UserOutlined, MailOutlined, LockOutlined, ArrowRightOutlined, ArrowLeftOutlined, CarOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import authHero from "../assets/auth-hero.png";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const FleetDriverRegisterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const next = () => {
    form.validateFields(['name', 'email', 'password', 'phone']).then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      // Form validation failed
    });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/register-fleet-driver", values);
      setSuccess(true);
      message.success("Registration Submitted Successfully!");
    } catch (err: any) {
      console.error("Fleet Registration Failed:", err);
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas-white)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <CarOutlined style={{ fontSize: '64px', color: 'var(--baobab-emerald)', marginBottom: '24px' }} />
          <Title level={2}>Registration Submitted</Title>
          <Paragraph style={{ fontSize: '16px', color: 'var(--ash-grey)' }}>
            Thank you for registering as a QSI Fleet Driver. Your application is currently pending admin approval.
            You will receive an email once your account has been approved.
          </Paragraph>
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            className="afro-button primary"
            style={{ marginTop: '24px', height: '56px', padding: '0 40px' }}
          >
            RETURN HOME
          </Button>
        </div>
      </div>
    );
  }

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
            background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)',
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
          <span className="eyebrow" style={{ color: 'white', opacity: 0.9 }}>Drive with QSI</span>
          <Title level={1} style={{ color: 'white', fontSize: '64px', margin: '20px 0', textTransform: 'uppercase' }}>
            Empower <br /> Mobility.
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
          padding: '40px 8%',
          overflowY: 'auto',
          '@media (min-width: 992px)': { flex: '0 0 600px', maxWidth: '600px' }
        } as any}
      >
        <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <span className="eyebrow">Fleet Network</span>
            <Title level={2} style={{ textTransform: 'uppercase', marginBottom: '16px' }}>DRIVER REGISTRATION</Title>
            <Paragraph style={{ color: 'var(--ash-grey)', fontSize: '16px' }}>
              Join our network of professional drivers providing mobility solutions across Africa.
            </Paragraph>
          </div>

          <Steps 
            current={currentStep} 
            items={[
              { title: 'Personal Info' },
              { title: 'Vehicle Info' }
            ]}
            style={{ marginBottom: '40px' }}
          />

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24, borderRadius: 0, border: '2px solid var(--terracotta-clay)' }}
            />
          )}

          <Form 
            form={form}
            name="fleet_register" 
            onFinish={onFinish} 
            layout="vertical"
            requiredMark={false}
          >
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="name" 
                    label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Full Name</span>}
                    rules={[{ required: true, message: 'Please enter your full name' }]}
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
                    rules={[{ required: true, type: "email", message: 'Please enter a valid email' }]}
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
                rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: 'var(--baobab-emerald)' }} />} 
                  placeholder="•••••••• (min 6 chars)" 
                  style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                />
              </Form.Item>

              <Form.Item 
                name="phone"
                label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Phone Number</span>}
                rules={[{ required: true, message: 'Phone number is required' }]}
              >
                <Input 
                  placeholder="+233 24 XXX XXXX" 
                  style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '24px' }}>
                <Button 
                  type="primary" 
                  onClick={next}
                  block 
                  className="afro-button primary"
                  style={{ height: '64px', fontSize: '16px' }}
                >
                  NEXT: VEHICLE INFO <ArrowRightOutlined />
                </Button>
              </Form.Item>
            </div>

            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="make" 
                    label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Vehicle Make</span>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input 
                      placeholder="e.g. Toyota" 
                      style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="model" 
                    label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Vehicle Model</span>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input 
                      placeholder="e.g. Hilux" 
                      style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item 
                    name="year" 
                    label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Year</span>}
                  >
                    <InputNumber 
                      placeholder="2020" 
                      style={{ width: '100%', height: '56px', paddingTop: '12px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item 
                    name="color" 
                    label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Color</span>}
                  >
                    <Input 
                      placeholder="e.g. White" 
                      style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="licensePlate" 
                    label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>License Plate</span>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input 
                      placeholder="ABC-123" 
                      style={{ height: '56px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="vehicleType" 
                    label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Type</span>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Select 
                      placeholder="Select type" 
                      style={{ height: '56px' }}
                      dropdownStyle={{ borderRadius: 0 }}
                    >
                      <Option value="SEDAN">Sedan</Option>
                      <Option value="SUV">SUV</Option>
                      <Option value="VAN">Van</Option>
                      <Option value="BUS">Minibus</Option>
                      <Option value="TRUCK">Truck</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item 
                name="capacity" 
                label={<span className="eyebrow" style={{ marginBottom: 0, fontSize: '10px' }}>Passenger Capacity</span>}
              >
                <InputNumber 
                  min={1} 
                  max={50} 
                  placeholder="4" 
                  style={{ width: '100%', height: '56px', paddingTop: '12px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                />
              </Form.Item>

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
                  I agree to the <Link to="/terms" style={{ color: 'var(--baobab-emerald)' }}>driver terms and conditions</Link>
                </Checkbox>
              </Form.Item>

              <Row gutter={16} style={{ marginTop: '24px' }}>
                <Col xs={8}>
                  <Button 
                    onClick={prev}
                    block 
                    style={{ height: '64px', fontSize: '16px', borderRadius: 0, border: '2px solid var(--onyx-black)' }}
                  >
                    <ArrowLeftOutlined /> BACK
                  </Button>
                </Col>
                <Col xs={16}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading} 
                    block 
                    className="afro-button primary"
                    style={{ height: '64px', fontSize: '16px' }}
                  >
                    SUBMIT REGISTRATION
                  </Button>
                </Col>
              </Row>
            </div>

            <div style={{ textAlign: "center", marginTop: '24px' }}>
              <Text style={{ color: 'var(--ash-grey)' }}>Already have an account?</Text>
              <Link 
                to="https://admin.qsi.africa" 
                style={{ marginLeft: '8px', color: 'var(--baobab-emerald)', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', fontFamily: 'var(--font-accent)' }}
              >
                Log In as Driver
              </Link>
            </div>
            <div style={{ textAlign: "center", marginTop: '8px' }}>
              <Link 
                to="/register" 
                style={{ color: 'var(--ash-grey)', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', fontFamily: 'var(--font-accent)' }}
              >
                Register as a regular user instead
              </Link>
            </div>
          </Form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 991px) {
          .hide-mobile { display: none !important; }
        }
        .ant-select-selector {
          border-radius: 0 !important;
          border: 2px solid var(--onyx-black) !important;
          height: 56px !important;
          align-items: center !important;
        }
      `}} />
    </div>
  );
};

export default FleetDriverRegisterPage;
