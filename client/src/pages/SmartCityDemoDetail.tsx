import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Spin,
  Typography,
  Button,
  Tag,
  Divider,
  Grid,
  Space,
  Modal,
  Form,
  Input,
  message,
  Radio,
} from "antd";
import {
  ArrowLeft,
  User,
  Mail,
  MessageCircle,
  Users,
  Lightbulb,
  MapPin,
  Phone,
  Zap,
  TrendingUp,
  Handshake,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const SmartCityDemoDetail: React.FC = () => {
  const { id } = useParams();
  const [demo, setDemo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [engagementModalVisible, setEngagementModalVisible] = useState<boolean>(false);
  const [engagementLoading, setEngagementLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [selectedEngagementType, setSelectedEngagementType] =
    useState<string>("partner");

  const engagementOptions = useMemo(
    () => [
      {
        value: "invest",
        label: "Invest",
        description: "Explore investment opportunities",
        icon: <TrendingUp size={24} />,
        color: "#ff4d4f",
      },
      {
        value: "participate",
        label: "Participate",
        description: "Engage as a participant",
        icon: <Users size={24} />,
        color: "var(--success-green)",
      },
      {
        value: "learn",
        label: "Learn",
        description: "Request more information",
        icon: <Lightbulb size={24} />,
        color: "var(--accent-primary)",
      },
      {
        value: "collaborate",
        label: "Collaborate",
        description: "Offer technical collaboration",
        icon: <Handshake size={24} />,
        color: "var(--text-tertiary)",
      },
    ],
    []
  );

  const fetchDemoDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/demos/${id}`);
      setDemo(response.data);
    } catch (err: any) {
      setError("Could not load demonstrator details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleEngagementSubmit = useCallback(
    async (values: any) => {
      setEngagementLoading(true);
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
        const payload = {
          pilotKey: id,
          pilotTitle: demo?.title,
          engagementType: values.engagementType,
          customIntent: values.customIntent,
          message: values.message,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          timestamp: new Date().toISOString(),
        };
        await axios.post(`${baseURL}/submit/pilot-engagement`, payload);
        message.success("Submission synchronized successfully!");
        setEngagementModalVisible(false);
        form.resetFields();
      } catch (error) {
        message.error("Failed to synchronize request.");
      } finally {
        setEngagementLoading(false);
      }
    },
    [id, demo?.title, form]
  );

  useEffect(() => {
    if (id) fetchDemoDetail();
  }, [fetchDemoDetail, id]);

  const styles = useMemo(() => ({
    markdown: {
      h3: (props: any) => <h3 className="text-2xl font-bold text-white mt-12 mb-6 uppercase tracking-tight" {...props} />,
      h4: (props: any) => <h4 className="text-xl font-bold text-white mt-8 mb-4 uppercase tracking-tight" {...props} />,
      p: (props: any) => <p className="text-lg text-text-secondary leading-relaxed mb-6" {...props} />,
      li: (props: any) => <li className="text-lg text-text-secondary mb-3 list-disc ml-6" {...props} />,
      strong: (props: any) => <strong className="font-black text-white" {...props} />,
    }
  }), []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-tight">{error || "Demonstrator Not Found"}</h2>
        <button className="qsi-button primary px-8 py-3" onClick={() => navigate("/demos")}>Back to Demos</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Detail Hero */}
      <header className="p-12 lg:p-20 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-12">
            <button 
              onClick={() => navigate("/demos")} 
              className="qsi-button flex items-center gap-2 py-2 px-4"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <Tag className={`rounded-full px-4 py-1 font-black uppercase text-[10px] ${demo.status === 'ACTIVE' ? 'bg-success-green/20 text-success-green border-success-green/30' : 'bg-accent-primary-soft text-accent-primary border-accent-primary-soft'}`}>
              {demo.status || "PROPOSED"}
            </Tag>
          </div>

          <h1 className="text-4xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
            {demo.title}
          </h1>

          {demo.city && (
            <div className="flex items-center gap-2 text-accent-primary">
              <MapPin size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">{demo.city}</span>
            </div>
          )}
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none">
           <Zap size={500} className="text-accent-primary" />
        </div>
      </header>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        <Row gutter={[64, 64]}>
          <Col xs={24} lg={16}>
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={styles.markdown}
              >
                {demo.expandedView || demo.shortDescription}
              </ReactMarkdown>
            </article>
          </Col>

          <Col xs={24} lg={8}>
            <div className="sticky top-12">
              <div className="feed-card bg-bg-secondary border-border-subtle p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-green via-accent-primary to-red-500" />
                <span className="eyebrow">Participation</span>
                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Engage With Demo</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  Join us in shaping the future of this demonstrator. We are actively seeking strategic partners, visionary investors, and technical participants to actualize this infrastructure.
                </p>
                <button 
                  className="qsi-button primary w-full py-4 font-bold flex items-center justify-center gap-2 shadow-xl shadow-accent-primary/10"
                  onClick={() => setEngagementModalVisible(true)}
                >
                  Request Collaboration <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* Engagement Modal */}
      <Modal
        title={null}
        open={engagementModalVisible}
        onCancel={() => setEngagementModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
        centered
        className="dark-modal"
      >
        <div className="p-8 lg:p-12 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <div className="text-center mb-10">
            <span className="eyebrow">Project Engagement</span>
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mt-2 mb-4">{demo.title}</h3>
            <div className="w-12 h-1 bg-accent-primary mx-auto" />
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEngagementSubmit}
            initialValues={{ engagementType: selectedEngagementType }}
            className="space-y-6"
          >
            <Form.Item
              name="engagementType"
              label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Engagement Pathway</span>}
              rules={[{ required: true }]}
            >
              <Radio.Group className="w-full">
                <Row gutter={[12, 12]}>
                  {engagementOptions.map((option) => (
                    <Col span={6} key={option.value}>
                      <div
                        onClick={() => {
                          setSelectedEngagementType(option.value);
                          form.setFieldValue("engagementType", option.value);
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer h-full ${selectedEngagementType === option.value ? 'bg-bg-primary border-accent-primary' : 'bg-bg-primary border-border-subtle hover:border-text-muted'}`}
                      >
                        <div className={`mb-3 ${selectedEngagementType === option.value ? 'text-accent-primary' : 'text-text-tertiary'}`}>
                          {option.icon}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest text-center ${selectedEngagementType === option.value ? 'text-white' : 'text-text-tertiary'}`}>
                          {option.label}
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Form.Item>

            <div className="pt-6 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item name="contactName" label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Full Name</span>} rules={[{ required: true }]}>
                  <Input className="bg-bg-primary border-border-subtle text-white h-10 rounded-xl" placeholder="Full Identity" />
                </Form.Item>
                <Form.Item name="contactEmail" label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Network Email</span>} rules={[{ required: true, type: 'email' }]}>
                  <Input className="bg-bg-primary border-border-subtle text-white h-10 rounded-xl" placeholder="Email@domain.com" />
                </Form.Item>
            </div>
            
            <Form.Item 
              name="message" 
              label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Brief Intent</span>} 
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none" placeholder="Describe your collaboration goals..." />
            </Form.Item>

            <div className="flex gap-4 pt-4">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit" disabled={engagementLoading}>
                {engagementLoading ? 'SYNCHRONIZING...' : 'SUBMIT REQUEST'}
              </button>
              <button className="qsi-button flex-1 py-4 font-bold" onClick={() => setEngagementModalVisible(false)}>
                CANCEL
              </button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default SmartCityDemoDetail;
