import React, { useState, useEffect } from 'react';
import { Form, Input, Typography, Tabs, App as AntApp, Row, Col, Card } from 'antd';
import { User, Lock, MapPin, Building, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ProfileHeader } from '../components/panx/ProfileHeader';

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
      {/* Standardized Profile Header */}
      <ProfileHeader
        name={user.name}
        role={user.role}
        bio={user.email}
        avatarUrl={user.avatarUrl}
        isVerified={true}
        isOwnProfile={true}
        extraActions={
          <button 
            onClick={handleLogoutClick}
            style={{
              padding: '8px 18px', borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#EF4444', fontWeight: 800, fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <LogOut size={14} /> Disconnect
          </button>
        }
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { key: '1', label: 'Operational Profile' },
          { key: '2', label: 'Security & Access' }
        ]}
      />

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
