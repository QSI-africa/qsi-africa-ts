import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  Typography,
  Tag,
  Grid,
  Modal,
  Form,
  Input,
  Radio,
  message,
  Alert
} from "antd";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Zap,
  Globe,
  Activity,
  Handshake,
  TrendingUp,
  Users,
  Lightbulb,
  ExternalLink,
  Share2
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      description: "Collaborate on this concept",
      icon: <Handshake size={24} />,
      color: "var(--success-green)",
    },
    {
      value: "invest",
      label: "Investment",
      description: "Invest in this framework",
      icon: <TrendingUp size={24} />,
      color: "#ff4d4f",
    },
    {
      value: "meeting",
      label: "Sync Request",
      description: "Schedule a technical brief",
      icon: <Users size={24} />,
      color: "var(--accent-gold)",
    },
    {
      value: "custom",
      label: "Other Intent",
      description: "Describe your interest",
      icon: <Lightbulb size={24} />,
      color: "var(--text-tertiary)",
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
      message.success("Engagement synchronized successfully!");
      setEngagementModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to synchronize request.");
    } finally {
      setEngagementLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const markdownComponents = {
    h1: (props: any) => <h1 className="text-3xl lg:text-4xl font-black text-white mt-12 mb-6 uppercase tracking-tight" {...props} />,
    h2: (props: any) => <h2 className="text-2xl lg:text-3xl font-bold text-white mt-10 mb-5 uppercase tracking-tight" {...props} />,
    h3: (props: any) => <h3 className="text-xl lg:text-2xl font-bold text-white mt-8 mb-4 uppercase tracking-tight" {...props} />,
    p: (props: any) => <p className="text-lg text-text-secondary leading-relaxed mb-6" {...props} />,
    li: (props: any) => <li className="text-lg text-text-secondary mb-3 list-disc ml-6" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-success-green bg-bg-secondary p-8 my-10 italic text-white rounded-r-2xl shadow-xl" {...props} />
    ),
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !pilot) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-tight">{error || "Concept Not Found"}</h2>
        <button className="qsi-button primary px-8 py-3" onClick={() => navigate('/concepts')}>Back to Concepts</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Hero Header */}
      <header className="p-12 lg:p-20 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/concepts')} 
            className="qsi-button flex items-center gap-2 mb-12 py-2 px-4"
          >
            <ArrowLeft size={18} /> Back to Concepts
          </button>
          
          <span className="eyebrow">Strategic Architecture</span>
          <h1 className="text-4xl lg:text-7xl font-black text-white mt-4 mb-8 uppercase tracking-tighter leading-none">
            {pilot.title}
          </h1>

          <div className="flex flex-wrap gap-8 items-center">
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar size={18} className="text-success-green" />
              <span className="text-xs font-bold uppercase tracking-widest">Published: {formatDate(pilot.createdAt)}</span>
            </div>
            <Tag className="rounded-full px-4 py-1 bg-bg-primary border-border-subtle text-text-tertiary font-black uppercase text-[10px]">
              Concept ID: {id?.substring(0, 8).toUpperCase()}
            </Tag>
          </div>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none">
           <Layers size={600} className="text-accent-gold" />
        </div>
      </header>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        <Row gutter={[64, 64]}>
          <Col xs={24} lg={16}>
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {pilot.expandedView}
              </ReactMarkdown>
            </article>
          </Col>

          <Col xs={24} lg={8}>
            <aside className="sticky top-12 space-y-8">
              <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-10 relative overflow-hidden group">
                <span className="eyebrow">Engagement</span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Collaborate</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-10">
                  This concept represents a strategic blueprint for African technical sovereignty. We are actively seeking partners and visionaries to actualize this framework within the ecosystem.
                </p>
                
                <div className="space-y-4">
                  <button 
                    className="qsi-button primary w-full py-4 font-black uppercase text-xs tracking-widest shadow-xl shadow-accent-gold/10"
                    onClick={() => setEngagementModalVisible(true)}
                  >
                    Express Interest
                  </button>
                  <button 
                    className="qsi-button w-full py-4 font-black uppercase text-xs tracking-widest"
                    onClick={() => navigate('/contact-us')}
                  >
                    Contact Team
                  </button>
                </div>

                <div className="mt-12 pt-8 border-t border-border-subtle/50 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-bg-primary border border-border-subtle flex items-center justify-center text-success-green shadow-xl">
                    <Activity size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block mb-1">Status</span>
                    <span className="text-sm font-bold text-white uppercase">Framework Validation</span>
                  </div>
                </div>
                <Zap size={120} className="absolute -bottom-8 -right-8 opacity-5 text-accent-gold group-hover:scale-110 transition-transform duration-700" />
              </div>

              <div className="px-4">
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block mb-4">Share Concept</span>
                <div className="flex gap-6">
                  <button className="text-[10px] font-black text-text-secondary hover:text-white transition-colors uppercase tracking-widest">Twitter</button>
                  <button className="text-[10px] font-black text-text-secondary hover:text-white transition-colors uppercase tracking-widest">LinkedIn</button>
                  <button className="text-[10px] font-black text-text-secondary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                     <Share2 size={12} /> Link
                  </button>
                </div>
              </div>
            </aside>
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
        centered
        destroyOnClose
        className="dark-modal"
      >
        <div className="p-8 lg:p-12 bg-bg-secondary rounded-3xl border border-border-subtle shadow-2xl">
          <div className="text-center mb-10">
            <span className="eyebrow">Strategic Intent</span>
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mt-2 mb-4">Collaborate on Framework</h3>
            <div className="w-12 h-1 bg-accent-gold mx-auto" />
          </div>
          
          <Form form={form} layout="vertical" onFinish={handleEngagementSubmit} className="space-y-6">
            <Form.Item 
              name="engagementType" 
              label={<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Engagement Pathway</span>}
              initialValue="partner"
            >
              <Radio.Group className="w-full">
                <div className="grid grid-cols-2 gap-4">
                  {engagementOptions.map((option) => (
                    <div 
                      key={option.value}
                      onClick={() => {
                        setSelectedEngagementType(option.value);
                        form.setFieldValue('engagementType', option.value);
                      }}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer h-full ${selectedEngagementType === option.value ? 'bg-bg-primary border-accent-gold shadow-lg' : 'bg-bg-primary border-border-subtle hover:border-text-muted'}`}
                    >
                      <div className={`mb-3 ${selectedEngagementType === option.value ? 'text-accent-gold' : 'text-text-tertiary'}`}>
                        {option.icon}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest text-center ${selectedEngagementType === option.value ? 'text-white' : 'text-text-tertiary'}`}>
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>

            <div className="pt-6 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item name="contactName" label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Full Name</span>} rules={[{ required: true }]}>
                <Input className="bg-bg-primary border-border-subtle text-white h-12 rounded-xl" placeholder="Full Identity" />
              </Form.Item>

              <Form.Item name="contactEmail" label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Network Email</span>} rules={[{ required: true, type: 'email' }]}>
                <Input className="bg-bg-primary border-border-subtle text-white h-12 rounded-xl" placeholder="Email@domain.com" />
              </Form.Item>
            </div>

            <Form.Item 
              name="message" 
              label={<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Strategic Context</span>}
            >
              <TextArea rows={4} className="bg-bg-primary border-border-subtle text-white rounded-xl resize-none" placeholder="Describe your collaborative vision or organizational interest..." />
            </Form.Item>

            <div className="flex gap-4 pt-4">
              <button className="qsi-button primary flex-1 py-4 font-bold flex items-center justify-center gap-2" type="submit" disabled={engagementLoading}>
                {engagementLoading ? 'SYNCHRONIZING...' : 'SUBMIT INTEREST'}
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

export default ConceptDetailPage;
