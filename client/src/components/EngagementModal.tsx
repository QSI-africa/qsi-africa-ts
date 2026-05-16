import React, { useState } from 'react';
import { Modal, Form, Input, Radio, message, ConfigProvider, theme } from 'antd';
import { 
  Handshake, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  X,
  Zap,
  Activity,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import axios from 'axios';

const { TextArea } = Input;

interface EngagementModalProps {
  visible: boolean;
  onClose: () => void;
  pilotId: string;
  pilotTitle: string;
  category: 'concept' | 'demo';
}

const EngagementModal: React.FC<EngagementModalProps> = ({ 
  visible, 
  onClose, 
  pilotId, 
  pilotTitle,
  category
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('partner');

  const engagementOptions = [
    { value: "partner", label: "Partner", icon: <Handshake /> },
    { value: "invest", label: "Invest", icon: <TrendingUp /> },
    { value: "meeting", label: "Sync", icon: <Users /> },
    { value: "custom", label: "Other", icon: <Lightbulb /> },
  ];

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const payload = {
        pilotKey: pilotId,
        pilotTitle: pilotTitle,
        category: category,
        ...values,
        timestamp: new Date().toISOString(),
      };
      await axios.post(`${baseURL}/submit/pilot-engagement`, payload);
      message.success("Collaboration request synchronized!");
      onClose();
      form.resetFields();
    } catch (err) {
      message.error("Synchronization failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Modal: {
            contentBg: 'transparent',
            padding: 0,
            borderRadiusLG: 48,
            boxShadow: 'none',
            colorBgMask: 'rgba(0, 0, 0, 0.8)'
          },
          Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.04)',
            colorBorder: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            controlHeight: 56,
            activeBorderColor: '#10B981',
            hoverBorderColor: 'rgba(16, 185, 129, 0.4)'
          }
        }
      }}
    >
      <Modal
        title={null}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        destroyOnClose
        centered
        closeIcon={null}
        className="engagement-glass-modal"
      >
        <div className="relative overflow-hidden" style={{ 
          backgroundColor: 'rgba(10, 18, 14, 0.98)', 
          backdropFilter: 'blur(60px)', 
          borderRadius: '48px', 
          border: '1px solid rgba(16,185,129,0.2)', 
          boxShadow: '0 40px 120px -20px rgba(0,0,0,0.9)',
          minHeight: '600px'
        }}>
          {/* Ambient Glows */}
          <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="p-10 md:p-16 relative z-10">
            {/* Header - Centered Strategy */}
            <div className="text-center mb-16 relative">
              <button 
                onClick={onClose}
                className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 z-50"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.6em] block mb-4">
                {category === 'concept' ? 'Frequency Calibration' : 'Network Calibration'}
              </span>
              <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                Initialize<br />Profile
              </h3>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_10px_var(--accent-primary)] animate-pulse" />
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20" />
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">{pilotTitle}</p>
            </div>

            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleFinish}
              initialValues={{ engagementType: 'partner' }}
              className="space-y-10"
            >
              <Form.Item name="engagementType">
                <Radio.Group className="w-full">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {engagementOptions.map((option) => (
                      <div 
                        key={option.value}
                        onClick={() => { setSelectedType(option.value); form.setFieldValue('engagementType', option.value); }}
                        style={{
                          background: selectedType === option.value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                          borderColor: selectedType === option.value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                          boxShadow: selectedType === option.value ? '0 15px 35px -5px rgba(16,185,129,0.3)' : 'none',
                          transform: selectedType === option.value ? 'translateY(-4px)' : 'none'
                        }}
                        className="flex flex-col items-center justify-center p-6 rounded-[32px] border transition-all duration-500 cursor-pointer aspect-square"
                      >
                        <div className={`mb-4 transition-colors duration-300 ${selectedType === option.value ? 'text-black' : 'text-accent-primary'}`}>
                          {React.cloneElement(option.icon as React.ReactElement, { size: 24, strokeWidth: 2.5 })}
                        </div>
                        <span style={{ color: selectedType === option.value ? 'black' : 'rgba(255,255,255,0.6)' }} className="text-[10px] font-black uppercase tracking-widest text-center">
                          {option.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Radio.Group>
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Form.Item 
                  name="contactName" 
                  label={<span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Operator Identity</span>}
                  rules={[{ required: true, message: 'Identity validation required' }]}
                >
                  <Input placeholder="FULL LEGAL NAME" className="font-bold tracking-tight px-6" />
                </Form.Item>
                <Form.Item 
                  name="contactEmail" 
                  label={<span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Strategic Terminal</span>}
                  rules={[{ required: true, type: 'email', message: 'Valid terminal address required' }]}
                >
                  <Input placeholder="EMAIL@NETWORK.IO" className="font-bold tracking-tight px-6" />
                </Form.Item>
              </div>

              <Form.Item 
                name="message" 
                label={<span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Collaborative Intent</span>}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Describe your architectural vision or strategic interest..." 
                  className="rounded-[24px] p-6 font-medium bg-white/5 border-white/10 text-white placeholder:text-white/10"
                />
              </Form.Item>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="qsi-btn qsi-btn-primary h-16 flex-1 text-[11px] font-black tracking-[0.3em]"
                >
                  {loading ? 'SYNCHRONIZING...' : 'ESTABLISH LINK'}
                </button>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="qsi-btn qsi-btn-secondary h-16 flex-1 text-[11px] font-black tracking-[0.3em] border-white/10 hover:bg-white/5"
                >
                  ABORT MISSION
                </button>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      <style>{`
        .engagement-glass-modal .ant-modal-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .engagement-glass-modal .ant-modal-mask {
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default EngagementModal;
