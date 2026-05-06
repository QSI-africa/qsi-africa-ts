import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  Typography,
  Tag,
  Divider,
  Grid,
  Space,
  Modal,
  Form,
  Input,
  Radio,
  List,
  Avatar,
  message,
  Alert
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  TeamOutlined,
  BulbOutlined,
  SendOutlined,
  RocketOutlined
} from "@ant-design/icons";
import axios from "axios";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GeometricCard, CornerAccent, AfroButton } from "../components/AfroBauhausComponents";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const { TextArea } = Input;

const ConceptDetailPage: React.FC = () => {
  const { id } = useParams();
  const [pilot, setPilot] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [engagementModalVisible, setEngagementModalVisible] = useState<boolean>(false);
  const [engagementLoading, setEngagementLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [selectedEngagementType, setSelectedEngagementType] = useState<string>("partner");

  const engagementOptions = useMemo(() => [
    {
      value: "partner",
      label: "Partnership",
      description: "Collaborate on this concept as a partner",
      icon: <FaRegHandshake />,
      color: "var(--baobab-emerald)",
    },
    {
      value: "invest",
      label: "Investment",
      description: "Invest in this concept",
      icon: <FaMoneyBillTrendUp />,
      color: "var(--terracotta-clay)",
    },
    {
      value: "meeting",
      label: "Request Meeting",
      description: "Schedule a meeting to discuss further",
      icon: <TeamOutlined />,
      color: "var(--ochre-yellow)",
    },
    {
      value: "custom",
      label: "Other Intentions",
      description: "Describe your specific interests",
      icon: <BulbOutlined />,
      color: "var(--onyx-black)",
    },
  ], []);

  const fetchPilotDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/concepts/${id}`);
      setPilot(response.data);
    } catch (err: any) {
      console.error("Failed to fetch concept details:", err);
      setError(err.response?.data?.error || "Could not load concept details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchPilotDetail();
  }, [fetchPilotDetail, id]);

  const handleEngagementSubmit = async (values: any) => {
    setEngagementLoading(true);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const payload = {
        pilotKey: id,
        pilotTitle: pilot?.title,
        ...values,
        timestamp: new Date().toISOString(),
      };
      await axios.post(`${baseURL}/submit/pilot-engagement`, payload);
      message.success("Engagement request submitted successfully!");
      setEngagementModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Engagement submission error:", error);
      message.error("Failed to submit request.");
    } finally {
      setEngagementLoading(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const cleanMarkdown = (text: string) => {
    if (!text) return "";
    return text.trim();
  };

  const markdownComponents = {
    h1: (props: any) => <Title level={1} style={{ textTransform: 'uppercase', marginTop: '40px', color: 'var(--onyx-black)' }} {...props} />,
    h2: (props: any) => <Title level={2} style={{ textTransform: 'uppercase', marginTop: '32px', color: 'var(--onyx-black)' }} {...props} />,
    h3: (props: any) => <Title level={3} style={{ textTransform: 'uppercase', marginTop: '24px', color: 'var(--onyx-black)' }} {...props} />,
    p: (props: any) => <Paragraph style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '24px', color: 'var(--onyx-black)' }} {...props} />,
    li: (props: any) => <li style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '8px', color: 'var(--onyx-black)' }} {...props} />,
    blockquote: (props: any) => (
      <blockquote style={{ 
        borderLeft: '4px solid var(--baobab-emerald)', 
        padding: '24px', 
        background: 'var(--papyrus-off-white)',
        margin: '32px 0',
        fontStyle: 'italic'
      }} {...props} />
    ),
  };

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><Spin size="large" /></div>;

  if (error || !pilot) return (
    <div className="container section-py" style={{ textAlign: 'center' }}>
      <Alert message={error || "Concept not found"} type="error" showIcon style={{ marginBottom: 40 }} />
      <AfroButton onClick={() => navigate('/concepts')}>Back to Concepts</AfroButton>
    </div>
  );

  return (
    <div style={{ background: 'var(--canvas-white)', minHeight: '100vh' }}>
      {/* Hero Header */}
      <section className="pattern-mudcloth" style={{ paddingTop: '140px', paddingBottom: '80px', borderBottom: '2px solid var(--onyx-black)' }}>
        <div className="container">
          <div style={{ marginBottom: '24px' }}>
            <AfroButton onClick={() => navigate('/concepts')} style={{ padding: '8px 16px', height: 'auto', fontSize: '12px' }}>
              <ArrowLeftOutlined /> BACK TO CONCEPTS
            </AfroButton>
          </div>
          
          <span className="eyebrow">Strategic Architecture</span>
          <Title style={{ fontSize: 'clamp(32px, 5vw, 64px)', textTransform: 'uppercase', margin: '16px 0 32px 0' }}>
            {pilot.title}
          </Title>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOutlined style={{ color: 'var(--baobab-emerald)' }} />
              <span className="eyebrow" style={{ margin: 0 }}>Published: {formatDate(pilot.createdAt)}</span>
            </div>
            <Tag style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', background: 'var(--onyx-black)', color: 'white', fontFamily: 'var(--font-accent)', textTransform: 'uppercase', padding: '4px 12px' }}>
              CONCEPT ID: {id?.substring(0, 8).toUpperCase()}
            </Tag>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container section-py">
        <div style={{ display: 'grid', gridTemplateColumns: screens.lg ? '1fr 350px' : '1fr', gap: '64px', alignItems: 'start' }}>
          
          <div className="reveal-up">
            <GeometricCard style={{ padding: screens.xs ? '24px' : '64px', position: 'relative' }}>
              <CornerAccent position="tl" />
              <CornerAccent position="br" color="var(--baobab-emerald)" />
              
              <article className="concept-article">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {cleanMarkdown(pilot.expandedView)}
                </ReactMarkdown>
              </article>
            </GeometricCard>
          </div>

          <aside className="reveal-up" style={{ position: screens.lg ? 'sticky' : 'static', top: '120px' }}>
            <GeometricCard style={{ padding: '32px', background: 'var(--papyrus-off-white)' }}>
              <span className="eyebrow">Engagement</span>
              <Title level={3} style={{ textTransform: 'uppercase', marginBottom: '24px', color: 'var(--onyx-black)' }}>Collaborate</Title>
              <Paragraph style={{ marginBottom: '32px', color: 'var(--onyx-black)' }}>
                This concept represents a strategic blueprint for African sovereignty. We are actively seeking partners and visionaries to actualize this framework.
              </Paragraph>
              
              <AfroButton primary style={{ width: '100%', marginBottom: '16px' }} onClick={() => setEngagementModalVisible(true)}>
                EXPRESS INTEREST
              </AfroButton>
              <AfroButton style={{ width: '100%' }} onClick={() => navigate('/contact-us')}>
                GET IN TOUCH
              </AfroButton>

              <Divider style={{ borderColor: 'var(--onyx-black)', opacity: 0.2 }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar icon={<RocketOutlined />} style={{ background: 'var(--baobab-emerald)', borderRadius: 0 }} />
                <div>
                  <Text strong style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', fontFamily: 'var(--font-accent)' }}>Status</Text>
                  <Text style={{ fontSize: '14px' }}>Framework Validation</Text>
                </div>
              </div>
            </GeometricCard>

            <div style={{ marginTop: '32px', padding: '0 12px' }}>
              <span className="eyebrow" style={{ fontSize: '10px' }}>Share this concept</span>
              <Space size="large" style={{ marginTop: '8px' }}>
                <Text style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>TWITTER</Text>
                <Text style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>LINKEDIN</Text>
                <Text style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>COPY LINK</Text>
              </Space>
            </div>
          </aside>

        </div>
      </section>

      {/* Engagement Modal */}
      <Modal
        title={null}
        open={engagementModalVisible}
        onCancel={() => setEngagementModalVisible(false)}
        footer={null}
        width={700}
        styles={{ body: { padding: 0 } }}
        centered
        destroyOnClose
      >
        <div style={{ padding: '48px', position: 'relative' }}>
          <CornerAccent position="tr" color="var(--baobab-emerald)" />
          <span className="eyebrow">Expression of Interest</span>
          <Title level={2} style={{ textTransform: 'uppercase', marginBottom: '32px' }}>Collaborate on this Concept</Title>
          
          <Form form={form} layout="vertical" onFinish={handleEngagementSubmit}>
            <Form.Item name="engagementType" label={<span className="eyebrow" style={{ fontSize: '10px' }}>Intention</span>}>
              <Radio.Group style={{ width: "100%" }} onChange={(e) => setSelectedEngagementType(e.target.value)}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {engagementOptions.map((option) => (
                    <div 
                      key={option.value}
                      onClick={() => {
                        setSelectedEngagementType(option.value);
                        form.setFieldValue('engagementType', option.value);
                      }}
                      style={{ 
                        padding: '16px', 
                        border: '2px solid var(--onyx-black)',
                        background: selectedEngagementType === option.value ? 'var(--papyrus-off-white)' : 'white',
                        cursor: 'pointer',
                        borderColor: selectedEngagementType === option.value ? 'var(--baobab-emerald)' : 'var(--onyx-black)'
                      }}
                    >
                      <div style={{ fontSize: '20px', color: option.color, marginBottom: '8px' }}>{option.icon}</div>
                      <Text strong style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase' }}>{option.label}</Text>
                      <Radio value={option.value} style={{ display: 'none' }} />
                    </div>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="contactName" label={<span className="eyebrow" style={{ fontSize: '10px' }}>Full Name</span>} rules={[{ required: true }]}>
              <Input style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', height: '48px' }} />
            </Form.Item>

            <Form.Item name="contactEmail" label={<span className="eyebrow" style={{ fontSize: '10px' }}>Email Address</span>} rules={[{ required: true, type: 'email' }]}>
              <Input style={{ borderRadius: 0, border: '2px solid var(--onyx-black)', height: '48px' }} />
            </Form.Item>

            <Form.Item name="message" label={<span className="eyebrow" style={{ fontSize: '10px' }}>Additional Context</span>}>
              <TextArea rows={4} style={{ borderRadius: 0, border: '2px solid var(--onyx-black)' }} />
            </Form.Item>

            <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
              <AfroButton primary style={{ flex: 1 }} onClick={() => form.submit()}>SUBMIT INTEREST</AfroButton>
              <AfroButton style={{ flex: 1 }} onClick={() => setEngagementModalVisible(false)}>CANCEL</AfroButton>
            </div>
          </Form>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .concept-article h1, .concept-article h2, .concept-article h3 {
          font-family: var(--font-heading);
          color: var(--onyx-black);
          letter-spacing: -0.01em;
        }
        .concept-article p, .concept-article li {
          font-family: var(--font-body);
          color: var(--onyx-black);
          opacity: 0.9;
        }
        .concept-article strong {
          color: var(--baobab-emerald);
        }
      `}} />
    </div>
  );
};

export default ConceptDetailPage;
