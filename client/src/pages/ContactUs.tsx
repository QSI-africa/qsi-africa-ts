import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Globe,
  Zap,
  Activity
} from "lucide-react";
import { Typography, Row, Col, Form, Input, notification } from 'antd';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const { Title, Text, Paragraph } = Typography;

const ContactUs: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log("Form submitted:", values);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      notification.success({
        message: 'Synchronization Complete',
        description: 'Your message has been received. Our systems are now aligning with your inquiry.',
        placement: 'bottomRight'
      });
      form.resetFields();
    } catch (error: any) {
      notification.error({ message: 'Synchronization Failure' });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: <MapPin size={20} />, title: "Headquarters", content: "No. 3 Jenkinson close, Chisipite, Harare", category: "Physical Location" },
    { icon: <Phone size={20} />, title: "Voice Uplink", content: "+263 771 099 675", link: "tel:+263771099675", category: "Telecommunications" },
    { icon: <Mail size={20} />, title: "Secure Email", content: "info@qsi.africa", link: "mailto:info@qsi.africa", category: "Digital Network" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      <UnifiedHeader title="Contact Us" />
      {/* Header */}
      <header className="p-12 lg:p-20 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <span className="eyebrow">Strategic Support</span>
          <h1 className="text-5xl lg:text-7xl font-black text-white mt-4 mb-8 tracking-tighter uppercase leading-none">
            Ecosystem <br/><span className="text-accent-primary">Synchronization</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
            Our infrastructure is ready to receive your vision. Reach out to the QSI team for strategic inquiries, collaborations, and technical audits.
          </p>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none">
           <Globe size={600} className="text-accent-primary" />
        </div>
      </header>

      <section className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        <Row gutter={[64, 64]}>
          {/* Info Column */}
          <Col xs={24} lg={10}>
            <div className="space-y-12 sticky top-12">
              <div className="space-y-8">
                {contactInfo.map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-14 h-14 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center justify-center text-accent-primary shadow-lg group-hover:border-accent-primary/40 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block mb-1">{item.category}</span>
                      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{item.title}</h3>
                      {item.link ? (
                        <a href={item.link} className="text-text-secondary hover:text-white transition-colors">{item.content}</a>
                      ) : (
                        <p className="text-text-secondary">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="feed-card bg-bg-secondary border-border-subtle relative overflow-hidden">
                <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-6">Operational Window</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Monday — Friday</span>
                    <span className="text-sm font-bold text-white">08:00 - 17:00 CAT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Weekend</span>
                    <span className="text-sm font-bold text-accent-primary">Emergency Sync Only</span>
                  </div>
                </div>
                <Zap size={100} className="absolute -bottom-8 -right-8 opacity-5 text-accent-primary" />
              </div>
            </div>
          </Col>

          {/* Form Column */}
          <Col xs={24} lg={14}>
            <div className="feed-card p-12 lg:p-16 relative overflow-hidden">
               <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">Transmit Briefing</h2>
                    <p className="text-text-tertiary mt-2">Initialize a secure communication sequence.</p>
                  </div>
                  <Activity size={32} className="text-accent-primary opacity-20" />
               </div>

               <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit}
                className="space-y-8"
               >
                  <Form.Item 
                    name="name" 
                    label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Full Name</span>}
                    rules={[{ required: true, message: 'Identity required for synchronization' }]}
                  >
                    <Input className="bg-bg-primary border-border-subtle text-white h-12 rounded-xl" placeholder="ENTER YOUR FULL LEGAL NAME" />
                  </Form.Item>

                  <Form.Item 
                    name="email" 
                    label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Network Email</span>}
                    rules={[
                      { required: true, message: 'Email required for uplink' },
                      { type: 'email', message: 'Invalid email format' }
                    ]}
                  >
                    <Input className="bg-bg-primary border-border-subtle text-white h-12 rounded-xl" placeholder="EMAIL@DOMAIN.COM" />
                  </Form.Item>

                  <Form.Item 
                    name="message" 
                    label={<span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Inquiry Briefing</span>}
                    rules={[{ required: true, message: 'Briefing content required' }]}
                  >
                    <Input.TextArea rows={6} className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none" placeholder="DESCRIBE YOUR VISION OR OPERATIONAL REQUIREMENTS..." />
                  </Form.Item>

                  <button className="qsi-button primary w-full py-5 text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-accent-primary/20" type="submit" disabled={loading}>
                     {loading ? 'SYNCHRONIZING...' : 'TRANSMIT MESSAGE'} <Send size={20} />
                  </button>
               </Form>
            </div>
          </Col>
        </Row>
      </section>
    </div>
  );
};

export default ContactUs;
