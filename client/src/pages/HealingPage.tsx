import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Row, Col, Button, Tag, 
  Space, Divider, List, Modal, Form, Input, 
  notification, Badge, Empty 
} from 'antd';
import { 
  HeartOutlined, SafetyCertificateOutlined, 
  MedicineBoxOutlined, SmileOutlined, 
  ThunderboltOutlined, StarOutlined,
  CheckCircleOutlined, InfoCircleOutlined,
  MessageOutlined 
} from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const HealingPage: React.FC = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInquiryModalVisible, setIsInquiryModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      // Fetching from admin route which we can reuse for public viewing if authorized
      const response = await api.get('/admin/healing-packages');
      setPackages(response.data.filter((p: any) => p.isActive));
    } catch (error) {
      console.error("Fetch packages error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsInquiryModalVisible(true);
  };

  const onFinishInquiry = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/logic/healing-inquiry', {
        ...values,
        packageId: selectedPackage?.id
      });
      notification.success({
        message: 'Inquiry Received',
        description: 'The QSI Healing Team will connect with you shortly for a personalized trajectory scan.'
      });
      setIsInquiryModalVisible(false);
      form.resetFields();
    } catch (error) {
      notification.error({ message: 'Submission Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '80px 20px', maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: 'var(--canvas-white)' }}>
      <div style={{ textAlign: 'center', marginBottom: 80, position: 'relative' }}>
        <div className="pattern-dots" style={{ position: 'absolute', top: -40, left: 0, right: 0, height: 200, opacity: 0.1, zIndex: 0 }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" style={{ color: 'var(--baobab-emerald)', fontWeight: 900 }}>Holistic Sovereignty</span>
          <Title level={1} style={{ color: 'var(--onyx-black)', fontSize: '4rem', marginTop: 10, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Healing & <span style={{ color: 'var(--baobab-emerald)' }}>Psychological Coherence</span>
          </Title>
          <Paragraph style={{ color: 'var(--ash-grey)', fontSize: '1.2rem', maxWidth: 800, margin: '0 auto', fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Infrastructure is only as strong as the minds that build and inhabit it. Access elite psychological support and frequency alignment programs.
          </Paragraph>
        </div>
      </div>

      <Row gutter={[40, 40]}>
        {/* Core Philosophy Section */}
        <Col xs={24} lg={10}>
          <div className="geometric-card" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div className="pattern-mudcloth" style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', opacity: 0.1 }}></div>
            <Title level={3} style={{ color: 'var(--onyx-black)', textTransform: 'uppercase' }}>The QSI Approach</Title>
            <div className="grid-border-t grid-border-emerald" style={{ width: '60px', margin: '20px 0' }} />
            
            <List
              itemLayout="horizontal"
              dataSource={[
                { title: 'Frequency Alignment', icon: <ThunderboltOutlined style={{ color: 'var(--baobab-emerald)' }} />, desc: 'Synchronizing personal goals with organizational trajectory.' },
                { title: 'Trauma Synthesis', icon: <HeartOutlined style={{ color: 'var(--terracotta-clay)' }} />, desc: 'Converting historical bottlenecks into fuel for innovation.' },
                { title: 'Sovereign Cognition', icon: <ThunderboltOutlined style={{ color: 'var(--ochre-yellow)' }} />, desc: 'De-coupling from limiting mental frameworks.' },
                { title: 'Relational Coherence', icon: <SmileOutlined style={{ color: 'var(--savanna-moss)' }} />, desc: 'Building high-trust network interactions.' }
              ]}
              renderItem={item => (
                <List.Item style={{ border: 'none', padding: '16px 0' }}>
                  <List.Item.Meta
                    avatar={<div style={{ padding: 12, background: 'var(--papyrus-off-white)', border: '1px solid var(--onyx-black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>}
                    title={<Text style={{ color: 'var(--onyx-black)', fontWeight: 900, textTransform: 'uppercase', fontSize: '14px', fontFamily: 'var(--font-accent)' }}>{item.title}</Text>}
                    description={<Text style={{ color: 'var(--ash-grey)', fontSize: '12px' }}>{item.desc}</Text>}
                  />
                </List.Item>
              )}
            />

            <div style={{ marginTop: 40, padding: 24, background: 'var(--papyrus-off-white)', border: '2px solid var(--baobab-emerald)', position: 'relative' }}>
               <Title level={5} style={{ color: 'var(--baobab-emerald)', margin: 0, textTransform: 'uppercase' }}>Verified Sovereign Healing</Title>
               <Paragraph style={{ color: 'var(--onyx-black)', marginTop: 10, fontSize: 13, fontWeight: 500 }}>
                 Our practitioners are vetted by the Sovereign Minds Network to ensure alignment with pan-African values and technological excellence.
               </Paragraph>
               <Button type="link" style={{ padding: 0, color: 'var(--baobab-emerald)', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}>
                 Learn about certification <SafetyCertificateOutlined />
               </Button>
            </div>
          </div>
        </Col>

        {/* Therapy Packages Section */}
        <Col xs={24} lg={14}>
          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow">Select Your Path</span>
            <Title level={3} style={{ color: 'var(--onyx-black)', textTransform: 'uppercase', margin: 0 }}>Specialized Trajectories</Title>
            <Text style={{ color: 'var(--ash-grey)', fontFamily: 'var(--font-accent)', fontSize: '12px' }}>Choose a trajectory aligned with your current evolutionary phase.</Text>
          </div>

          <Row gutter={[24, 24]}>
            {packages.length > 0 ? (
              packages.map(pkg => (
                <Col xs={24} sm={12} key={pkg.id}>
                  <div 
                    className="geometric-card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '320px',
                      padding: '24px',
                      background: 'var(--canvas-white)',
                      boxShadow: '6px 6px 0px var(--onyx-black)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <Tag style={{ borderRadius: 0, background: 'var(--onyx-black)', color: 'var(--canvas-white)', border: 'none', padding: '2px 8px', fontSize: '10px', fontWeight: 700, marginBottom: 12 }}>
                        {pkg.duration.toUpperCase()}
                      </Tag>
                      <Title level={4} style={{ color: 'var(--onyx-black)', margin: 0, textTransform: 'uppercase', fontSize: '18px' }}>{pkg.title}</Title>
                      <Paragraph style={{ color: 'var(--ash-grey)', marginTop: 12, fontSize: '13px', lineHeight: 1.5 }} ellipsis={{ rows: 3 }}>
                        {pkg.shortPreview}
                      </Paragraph>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--papyrus-off-white)' }}>
                      <Text style={{ color: 'var(--baobab-emerald)', fontSize: '20px', fontWeight: 900 }}>${pkg.fee}</Text>
                      <Button 
                        className="afro-button primary" 
                        style={{ height: '40px', padding: '0 20px', fontSize: '12px' }} 
                        onClick={() => handleInquiry(pkg)}
                      >
                        {pkg.cta ? pkg.cta.toUpperCase() : 'INQUIRE'}
                      </Button>
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description={<Text style={{ color: 'var(--ash-grey)' }}>No standard packages currently active. Contact the Assistant for custom logic.</Text>} />
              </Col>
            )}
          </Row>
          
          <div 
            style={{ 
              marginTop: 40, 
              background: 'var(--onyx-black)', 
              padding: '40px',
              border: '3px solid var(--baobab-emerald)',
              boxShadow: '12px 12px 0px var(--baobab-emerald)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="pattern-mudcloth" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}></div>
            <Row align="middle" gutter={24} style={{ position: 'relative', zIndex: 1 }}>
              <Col xs={24} md={16}>
                <Title level={4} style={{ color: 'var(--canvas-white)', margin: 0, textTransform: 'uppercase' }}>Need Custom Organizational Alignment?</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', marginTop: 12, fontFamily: 'var(--font-accent)', fontSize: '13px' }}>
                  We provide group coherence workshops for engineering teams and visionary organizations.
                </Paragraph>
              </Col>
              <Col xs={24} md={8}>
                 <Button 
                   block 
                   size="large" 
                   icon={<MessageOutlined />}
                   className="afro-button"
                   style={{ background: 'var(--canvas-white)', border: 'none', color: 'var(--onyx-black)', height: '56px' }}
                 >
                   CONTACT TEAM
                 </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Inquiry Modal */}
      <Modal
        title={selectedPackage ? `INITIATE: ${selectedPackage.title.toUpperCase()}` : 'TRAJECTORY INQUIRY'}
        open={isInquiryModalVisible}
        onCancel={() => setIsInquiryModalVisible(false)}
        footer={null}
        styles={{
          content: {
            borderRadius: 0,
            border: '4px solid var(--onyx-black)',
            padding: '40px',
            boxShadow: '15px 15px 0px var(--onyx-black)'
          },
          header: {
            background: 'transparent',
            borderBottom: '2px solid var(--onyx-black)',
            marginBottom: '24px',
            paddingBottom: '16px'
          }
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinishInquiry}>
          <Paragraph style={{ color: 'var(--ash-grey)', fontFamily: 'var(--font-accent)', fontSize: '13px', marginBottom: '24px' }}>
            Tell us slightly more about your current coherence needs so we can assign the best practitioner.
          </Paragraph>
          <Form.Item 
            name="message" 
            label={<span className="eyebrow" style={{ fontSize: '10px' }}>Current State Summary</span>} 
            rules={[{ required: true }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="e.g. Navigating high-stress transition, seeking creative clarity..." 
              style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', padding: '12px' }}
            />
          </Form.Item>
          <Form.Item 
            name="preference" 
            label={<span className="eyebrow" style={{ fontSize: '10px' }}>Preferred Session Mode</span>}
          >
            <Select 
              placeholder="Select mode"
              style={{ height: '48px' }}
              dropdownStyle={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }}
            >
              <Select.Option value="VIDEO">Secure Video (QSI TV)</Select.Option>
              <Select.Option value="AUDIO">Audio Only</Select.Option>
              <Select.Option value="TEXT">Async Text Guidance</Select.Option>
            </Select>
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            loading={loading} 
            size="large"
            className="afro-button primary"
            style={{ height: '64px', marginTop: '12px' }}
          >
            REQUEST TRAJECTORY SCAN
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default HealingPage;
