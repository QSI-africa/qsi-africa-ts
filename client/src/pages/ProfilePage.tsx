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
      <header className="p-12 lg:p-20 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="relative">
              <div 
                style={{
                  width: '100px', height: '100px', borderRadius: '32px',
                  background: `linear-gradient(135deg, ${GREEN}30 0%, ${GREEN}05 100%)`,
                  border: `1.5px solid ${GREEN}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: GREEN,
                  boxShadow: `0 15px 35px -5px ${GREEN}30`
                }}
              >
                <User size={48} strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-green rounded-full flex items-center justify-center text-black border-2 border-bg-secondary shadow-lg">
                <CheckCircle2 size={12} strokeWidth={3} />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center mb-3">
                <Tag color="cyan" style={{ border: 'none', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                  {user.role}
                </Tag>
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Active Node</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 justify-center md:justify-start text-text-secondary">
                <Mail size={14} />
                <span className="text-sm font-semibold">{user.email}</span>
              </div>
            </div>

            <div>
              <button 
                onClick={handleLogoutClick}
                className="qsi-button flex items-center gap-2 py-3 px-6 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
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
                label: <span className="text-xs font-black uppercase tracking-widest px-2 py-1">Operational Profile</span>,
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
                          label={<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Full Name</span>}
                          rules={[{ required: true, message: 'Please enter your name.' }]}
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
                          label={<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Phone Number</span>}
                        >
                          <Input
                            prefix={<Phone size={16} className="text-white/20 mr-2" />}
                            placeholder="e.g. +234 803 123 4567"
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
                          label={<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Location / Region</span>}
                        >
                          <Input
                            prefix={<MapPin size={16} className="text-white/20 mr-2" />}
                            placeholder="e.g. Lagos, Nigeria"
                            style={inputStyle}
                            className="custom-input-focus"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="organization"
                          label={<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Organization</span>}
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
                          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em',
                          padding: '16px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          boxShadow: `0 8px 20px -6px ${GREEN}40`
                        }}
                      >
                        {profileLoading ? 'SAVING DETAILS...' : 'SAVE PROFILE DETAILS'}
                      </button>
                    </div>
                  </Form>
                )
              },
              {
                key: '2',
                label: <span className="text-xs font-black uppercase tracking-widest px-2 py-1">Security Key</span>,
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
                      label={<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Current Key (Password)</span>}
                      rules={[{ required: true, message: 'Please enter your current key.' }]}
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
                      label={<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">New Key (Password)</span>}
                      rules={[
                        { required: true, message: 'Please enter your new key.' },
                        { min: 6, message: 'Password must be at least 6 characters.' }
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
                      label={<span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Confirm New Key</span>}
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Confirm your password.' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match.'));
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
                          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em',
                          padding: '16px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          boxShadow: `0 8px 20px -6px ${GREEN}40`
                        }}
                      >
                        {passwordLoading ? 'UPDATING KEY...' : 'UPDATE SECURITY KEY'}
                      </button>
                    </div>
                  </Form>
                )
              },
              {
                key: '3',
                label: <span className="text-xs font-black uppercase tracking-widest px-2 py-1">Node Registry</span>,
                children: (
                  <div style={{ marginTop: '24px' }}>
                    <Paragraph className="text-text-secondary leading-relaxed mb-6">
                      This QSI sector node has authenticated access to the pan-African sovereign infrastructure. Current active permissions and registries associated with your digital identifier are detailed below.
                    </Paragraph>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Authority Role</span>
                        <div className="text-xl font-bold text-white uppercase mt-2">{user.role}</div>
                      </Card>
                      <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Resonance Hub</span>
                        <div className="text-xl font-bold text-white uppercase mt-2">{user.location || 'Pan-African'}</div>
                      </Card>
                      <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Unique Identifier</span>
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
