import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Typography,
  App as AntApp,
  Alert,
} from "antd";
import { User, Mail, Lock, ArrowRight, ShieldPlus } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Text } = Typography;
const GREEN = '#10B981';

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
      await register(values.name, values.email, values.password);
      message.success("Operational sector registered.");
      const from = location.state?.from?.pathname || "/onboarding";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: `${GREEN}10`, borderRadius: '50%', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: `${GREEN}05`, borderRadius: '50%', filter: 'blur(60px)' }} />

      <div className="w-full max-w-md reveal-up relative z-10">
        <div className="text-center mb-10">
          <div style={{ 
            width: '64px', height: '64px', background: `${GREEN}15`, borderRadius: '20px', 
            border: `1px solid ${GREEN}30`, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', mx: 'auto', mb: '24px', margin: '0 auto 24px',
            color: GREEN, boxShadow: `0 10px 25px -5px ${GREEN}40`
          }}>
             <ShieldPlus size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Sector <span style={{ color: GREEN }}>Registration</span></h1>
          <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest opacity-60">Initialize Sovereign Profile</p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              color: '#ef4444', 
              fontSize: '13px', 
              fontWeight: 600,
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <Form 
            name="register" 
            onFinish={onFinish} 
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item 
              name="name" 
              label={<span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Operator Name</span>}
              rules={[{ required: true }]}
            >
              <Input 
                prefix={<User size={18} style={{ color: 'rgba(255,255,255,0.2)', marginRight: '8px' }} />} 
                placeholder="Sovereign Architect" 
                style={{ 
                  height: '52px', background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', 
                  color: 'white', padding: '0 16px', fontSize: '14px', fontWeight: 500,
                  transition: 'all 0.3s'
                }}
                className="custom-input-focus"
              />
            </Form.Item>

            <Form.Item 
              name="email" 
              label={<span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Operation Email</span>}
              rules={[{ required: true, type: "email" }]}
            >
              <Input 
                prefix={<Mail size={18} style={{ color: 'rgba(255,255,255,0.2)', marginRight: '8px' }} />} 
                placeholder="architect@qsi.africa" 
                style={{ 
                  height: '52px', background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', 
                  color: 'white', padding: '0 16px', fontSize: '14px', fontWeight: 500,
                  transition: 'all 0.3s'
                }}
                className="custom-input-focus"
              />
            </Form.Item>

            <Form.Item 
              name="password" 
              label={<span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Security Key</span>}
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password 
                prefix={<Lock size={18} style={{ color: 'rgba(255,255,255,0.2)', marginRight: '8px' }} />} 
                placeholder="••••••••" 
                style={{ 
                  height: '52px', background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', 
                  color: 'white', padding: '0 16px', fontSize: '14px', fontWeight: 500,
                  transition: 'all 0.3s'
                }}
                className="custom-input-focus"
              />
            </Form.Item>

            <Form.Item className="mb-0 mt-8">
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  width: '100%', height: '56px', borderRadius: '18px', border: 'none',
                  background: GREEN, color: 'white', fontSize: '14px', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 12px 24px -6px ${GREEN}60`
                }}
              >
                {loading ? 'INITIALIZING...' : 'INITIALIZE SECTOR'} <ArrowRight size={20} />
              </button>
            </Form.Item>
          </Form>
        </div>

        <div className="text-center mt-10">
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 600 }}>Already registered?</Text>
          <Link 
            to="/login" 
            style={{ 
              marginLeft: '8px', color: GREEN, fontWeight: 800, fontSize: '13px', 
              textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}
          >
            Access Platform
          </Link>
        </div>
      </div>

      <style>{`
        .custom-input-focus:focus, .custom-input-focus:hover {
          border-color: ${GREEN} !important;
          background: rgba(16, 185, 129, 0.04) !important;
          box-shadow: 0 0 0 2px ${GREEN}15 !important;
        }
        .ant-input-password-icon { color: rgba(255,255,255,0.3) !important; }
      `}</style>
    </div>
  );
};

export default RegisterPage;
