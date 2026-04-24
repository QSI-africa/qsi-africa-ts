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
    <div style={{ padding: '60px 20px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <Badge status="processing" text={<Text style={{ color: '#10b981', tracking: 2 }}>HOLISTIC SOVEREIGNTY</Text>} />
        <Title level={1} style={{ color: '#fff', fontSize: '3rem', marginTop: 10 }}>
          Healing & <span style={{ color: '#10b981' }}>Psychological Coherence</span>
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: 700, margin: '0 auto' }}>
          Infrastructure is only as strong as the minds that build and inhabit it. Access elite psychological support and frequency alignment programs.
        </Paragraph>
      </div>

      <Row gutter={[40, 40]}>
        {/* Core Philosophy Section */}
        <Col xs={24} lg={10}>
          <Card className="glass-card" style={{ height: '100%' }}>
            <Title level={3} style={{ color: '#fff' }}>The QSI Approach</Title>
            <Divider style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            
            <List
              itemLayout="horizontal"
              dataSource={[
                { title: 'Frequency Alignment', icon: <ThunderboltOutlined style={{ color: '#10b981' }} />, desc: 'Synchronizing personal goals with organizational trajectory.' },
                { title: 'Trauma Synthesis', icon: <HeartOutlined style={{ color: '#ff4d4f' }} />, desc: 'Converting historical bottlenecks into fuel for innovation.' },
                { title: 'Sovereign Cognition', icon: <ThunderboltOutlined style={{ color: '#faad14' }} />, desc: 'De-coupling from limiting mental frameworks.' },
                { title: 'Relational Coherence', icon: <SmileOutlined style={{ color: '#1890ff' }} />, desc: 'Building high-trust network interactions.' }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<div style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 50 }}>{item.icon}</div>}
                    title={<Text style={{ color: '#fff', fontWeight: 600 }}>{item.title}</Text>}
                    description={<Text style={{ color: 'rgba(255,255,255,0.45)' }}>{item.desc}</Text>}
                  />
                </List.Item>
              )}
            />

            <div style={{ marginTop: 40, padding: 24, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
               <Title level={5} style={{ color: '#10b981', margin: 0 }}>Verified Sovereign Healing</Title>
               <Paragraph style={{ color: '#fff', marginTop: 10, fontSize: 13 }}>
                 Our practitioners are vetted by the Sovereign Minds Network to ensure alignment with pan-African values and technological excellence.
               </Paragraph>
               <Button type="link" style={{ padding: 0 }}>Learn about certification <SafetyCertificateOutlined /></Button>
            </div>
          </Card>
        </Col>

        {/* Therapy Packages Section */}
        <Col xs={24} lg={14}>
          <div style={{ marginBottom: 24 }}>
            <Title level={3} style={{ color: '#fff' }}>Specialized Trajectories</Title>
            <Text style={{ color: 'rgba(255,255,255,0.45)' }}>Select a path aligned with your current evolutionary phase.</Text>
          </div>

          <Row gutter={[20, 20]}>
            {packages.length > 0 ? (
              packages.map(pkg => (
                <Col xs={24} sm={12} key={pkg.id}>
                  <Card 
                    className="glass-card premium-hover" 
                    bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: 260 }}
                  >
                    <div style={{ flex: 1 }}>
                      <Tag color="cyan" style={{ marginBottom: 12 }}>{pkg.duration}</Tag>
                      <Title level={4} style={{ color: '#fff', margin: 0 }}>{pkg.title}</Title>
                      <Paragraph style={{ color: 'rgba(255,255,255,0.45)', marginTop: 12, fontSize: 14 }} ellipsis={{ rows: 3 }}>
                        {pkg.shortPreview}
                      </Paragraph>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#10b981', fontSize: 18, fontWeight: 700 }}>${pkg.fee}</Text>
                      <Button type="primary" shape="round" onClick={() => handleInquiry(pkg)}>
                        {pkg.cta || 'Inquire'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty description={<Text style={{ color: 'rgba(255,255,255,0.3)' }}>No standard packages currently active. Contact the Assistant for custom logic.</Text>} />
              </Col>
            )}
          </Row>
          
          <Card 
            style={{ marginTop: 24, background: 'linear-gradient(135deg, #0A1931 0%, #150E56 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
            bodyStyle={{ padding: 32 }}
          >
            <Row align="middle" gutter={24}>
              <Col xs={24} md={18}>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>Need Custom Organizational Alignment?</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                  We provide group coherence workshops for engineering teams and visionary organizations.
                </Paragraph>
              </Col>
              <Col xs={24} md={6}>
                 <Button ghost block size="large" icon={<MessageOutlined />}>Contact Team</Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Inquiry Modal */}
      <Modal
        title={selectedPackage ? `Initiate ${selectedPackage.title}` : 'Trajectory Inquiry'}
        open={isInquiryModalVisible}
        onCancel={() => setIsInquiryModalVisible(false)}
        footer={null}
        className="glass-card"
      >
        <Form form={form} layout="vertical" onFinish={onFinishInquiry}>
          <Paragraph style={{ color: 'rgba(0,0,0,0.6)' }}>
            Tell us slightly more about your current coherence needs so we can assign the best practitioner.
          </Paragraph>
          <Form.Item name="message" label="Current State Summary" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="e.g. Navigating high-stress transition, seeking creative clarity..." />
          </Form.Item>
          <Form.Item name="preference" label="Preferred Session Mode">
            <Select placeholder="Select mode">
              <Select.Option value="VIDEO">Secure Video (QSI TV)</Select.Option>
              <Select.Option value="AUDIO">Audio Only</Select.Option>
              <Select.Option value="TEXT">Async Text Guidance</Select.Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} size="large">
            Request Trajectory Scan
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default HealingPage;
