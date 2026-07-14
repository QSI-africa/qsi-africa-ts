import React, { useState, useEffect } from 'react';
import { Form, Input, Typography, Tabs, App as AntApp, Row, Col, Card, Tag } from 'antd';
import { User, Lock, Mail, MapPin, Building, Phone, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Paragraph } = Typography;
const GREEN = '#10B981';

const ProfilePage: React.FC = () => {
  const { user, refetchUser, logout } = useAuth()!;
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        phone: user.phone || '',
        location: user.location || '',
        organization: user.organization || '',
      });
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (values: any) => {
    setProfileLoading(true);
    try {
      await api.put('/auth/profile', values);
      message.success("Operational profile updated successfully.");
      await refetchUser();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to update profile.";
      message.error(errMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: any) => {
    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Security credentials updated. Please use new key.");
      passwordForm.resetFields();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to update password.";
      message.error(errMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    message.info("Operational session terminated.");
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Header Profile Summary */}
      <header className="p-6 md:p-12 lg:p-20 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
            <div className="relative shrink-0">
              <div 
                className="flex items-center justify-center rounded-[24px] md:rounded-[32px] w-[80px] h-[80px] md:w-[100px] md:h-[100px]"
                style={{
                  background: `linear-gradient(135deg, ${GREEN}30 0%, ${GREEN}05 100%)`,
                  border: `1.5px solid ${GREEN}40`,
                  color: GREEN,
                  boxShadow: `0 15px 35px -5px ${GREEN}30`
                }}
              >
                <User className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-green rounded-full flex items-center justify-center text-black border-2 border-bg-secondary shadow-lg">
                <CheckCircle2 size={12} strokeWidth={3} />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start items-center mb-2 md:mb-3">
                <Tag color="cyan" style={{ border: 'none', borderRadius: '4px', textTransform: 'none', fontWeight: 'bold', letterSpacing: '0.05em', margin: 0 }}>
                  {user.role}
                </Tag>
                <span className="text-[10px] font-bold text-text-tertiary tracking-widest" style={{ textTransform: 'none' }}>Active Node</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3 md:mb-4">
                {user.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start text-text-secondary">
                <Mail size={14} />
                <span className="text-xs md:text-sm font-semibold">{user.email}</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <button 
                onClick={handleLogoutClick}
                className="qsi-button flex items-center justify-center gap-2 py-2 px-4 md:py-3 md:px-6 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-colors w-full md:w-auto"
                style={{ borderColor: 'rgba(255,255,255,0.08)', textTransform: 'none' }}
              >
                <LogOut size={16} /> Disconnect
              </button>
            </div>
          </div>
        </div>
        
        {/* Background glow orb */}
        <div style={{ position: 'absolute', top: '50%', right: '10%', width: '300px', height: '300px', background: `${GREEN}05`, borderRadius: '50%', filter: 'blur(80px)' }} />
      </header>

      {/* Main Form Dashboard */}
      <section className="max-w-4xl mx-auto w-full p-8 lg:p-12 flex-1">
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '24px',
            padding: '32px'
          }}
          className="shadow-2xl"
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: '1',
                label: <span className="text-xs font-black tracking-widest px-2 py-1" style={{ textTransform: 'none' }}>Operational Profile</span>,
                children: (
                  <Form
                    form={profileForm}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={handleProfileSubmit}
                    style={{ marginTop: '24px' }}
                  >
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="name"
                          label={<span className="text-[10px] font-black tracking-widest text-text-secondary" style={{ textTransform: 'none' }}>Full Name</span>}
                          rules={[{ required: true, message: 'pleaseEnterYourName' }]}
                        >
                          <Input
                            prefix={<User size={16} className="text-white/20 mr-2" />}
                            style={inputStyle}
                            className="custom-input-focus"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="phone"
                          label={<span className="text-[10px] font-black tracking-widest text-text-secondary" style={{ textTransform: 'none' }}>Phone Number</span>}
                        >
                          <Input
                            prefix={<Phone size={16} className="text-white/20 mr-2" />}
                            placeholder="eg2348031234567"
                            style={inputStyle}
                            className="custom-input-focus"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="location"
                          label={<span className="text-[10px] font-black tracking-widest text-text-secondary" style={{ textTransform: 'none' }}>Location / Region</span>}
                        >
                          <Input
                            prefix={<MapPin size={16} className="text-white/20 mr-2" />}
                            placeholder="egLagosNigeria"
                            style={inputStyle}
                            className="custom-input-focus"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="organization"
                          label={<span className="text-[10px] font-black tracking-widest text-text-secondary" style={{ textTransform: 'none' }}>Organization</span>}
                        >
                          <Input
                            prefix={<Building size={16} className="text-white/20 mr-2" />}
                            placeholder="e.g. Sovereign Tech Corp"
                            style={inputStyle}
                            className="custom-input-focus"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        style={{
                          background: GREEN, color: 'black', fontWeight: 900,
                          fontSize: '11px', textTransform: 'none', letterSpacing: '0.15em',
                          padding: '16px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          boxShadow: `0 8px 20px -6px ${GREEN}40`
                        }}
                      >
                        {profileLoading ? 'Saving Details...' : 'Save Profile Details'}
                      </button>
                    </div>
                  </Form>
                )
              },
              {
                key: '2',
                label: <span className="text-xs font-black tracking-widest px-2 py-1" style={{ textTransform: 'none' }}>Security Key</span>,
                children: (
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={handlePasswordSubmit}
                    style={{ marginTop: '24px' }}
                  >
                    <Form.Item
                      name="currentPassword"
                      label={<span className="text-[10px] font-black tracking-widest text-text-secondary" style={{ textTransform: 'none' }}>Current Key (Password)</span>}
                      rules={[{ required: true, message: 'pleaseEnterYourCurrentKey' }]}
                    >
                      <Input.Password
                        prefix={<Lock size={16} className="text-white/20 mr-2" />}
                        placeholder="••••••••"
                        style={inputStyle}
                        className="custom-input-focus"
                      />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label={<span className="text-[10px] font-black tracking-widest text-text-secondary" style={{ textTransform: 'none' }}>New Key (Password)</span>}
                      rules={[
                        { required: true, message: 'pleaseEnterYourNewKey' },
                        { min: 6, message: 'passwordMustBeAtLeast6Characters' }
                      ]}
                    >
                      <Input.Password
                        prefix={<Lock size={16} className="text-white/20 mr-2" />}
                        placeholder="••••••••"
                        style={inputStyle}
                        className="custom-input-focus"
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label={<span className="text-[10px] font-black tracking-widest text-text-secondary" style={{ textTransform: 'none' }}>Confirm New Key</span>}
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'confirmYourPassword' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('passwordsDoNotMatch'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<Lock size={16} className="text-white/20 mr-2" />}
                        placeholder="••••••••"
                        style={inputStyle}
                        className="custom-input-focus"
                      />
                    </Form.Item>

                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        style={{
                          background: GREEN, color: 'black', fontWeight: 900,
                          fontSize: '11px', textTransform: 'none', letterSpacing: '0.15em',
                          padding: '16px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          boxShadow: `0 8px 20px -6px ${GREEN}40`
                        }}
                      >
                        {passwordLoading ? 'Updating Key...' : 'Update Security Key'}
                      </button>
                    </div>
                  </Form>
                )
              },
              {
                key: '3',
                label: <span className="text-xs font-black tracking-widest px-2 py-1" style={{ textTransform: 'none' }}>Node Registry</span>,
                children: (
                  <div style={{ marginTop: '24px' }}>
                    <Paragraph className="text-text-secondary leading-relaxed mb-6">
                      This QSI sector node has authenticated access to the pan-African sovereign infrastructure. Current active permissions and registries associated with your digital identifier are detailed below.
                    </Paragraph>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
                        <span className="text-[9px] font-black text-text-tertiary tracking-widest" style={{ textTransform: 'none' }}>Authority Role</span>
                        <div className="text-xl font-bold text-white uppercase mt-2">{user.role}</div>
                      </Card>
                      <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
                        <span className="text-[9px] font-black text-text-tertiary tracking-widest" style={{ textTransform: 'none' }}>Resonance Hub</span>
                        <div className="text-xl font-bold text-white uppercase mt-2">{user.location || 'Pan-African'}</div>
                      </Card>
                      <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
                        <span className="text-[9px] font-black text-text-tertiary tracking-widest" style={{ textTransform: 'none' }}>Unique Identifier</span>
                        <div className="text-[11px] font-mono text-white/50 mt-2 break-all">{user.id}</div>
                      </Card>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </div>
      </section>

      {/* Styled custom classes hover details */}
      <style>{`
        .custom-input-focus:focus, .custom-input-focus:hover {
          border-color: ${GREEN} !important;
          background: rgba(16, 185, 129, 0.04) !important;
          box-shadow: 0 0 0 2px ${GREEN}15 !important;
        }
        .ant-tabs-nav {
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.08) !important;
          margin-bottom: 24px !important;
        }
        .ant-tabs-tab {
          color: rgba(255,255,255,0.4) !important;
          padding: 12px 0 !important;
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
        }
        .ant-tabs-ink-bar {
          background-color: ${GREEN} !important;
          height: 3px !important;
        }
        .ant-input-password-icon { color: rgba(255,255,255,0.3) !important; }
      `}</style>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  height: '52px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  color: 'white',
  padding: '0 16px',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.3s'
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
};

export default ProfilePage;
