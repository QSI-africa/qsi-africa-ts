import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Form, Input, message, ConfigProvider, theme } from 'antd';
import {
  ArrowLeft,
  Handshake,
  TrendingUp,
  Users,
  Lightbulb,
  Rocket,
  Eye,
  Send,
  X,
  Calendar,
  Image as ImageIcon,
  Play
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { TextArea } = Input;

const iconMap: Record<string, React.ReactNode> = {
  Handshake: <Handshake size={20} strokeWidth={2.5} />,
  TrendingUp: <TrendingUp size={20} strokeWidth={2.5} />,
  Users: <Users size={20} strokeWidth={2.5} />,
  Lightbulb: <Lightbulb size={20} strokeWidth={2.5} />,
  Rocket: <Rocket size={20} strokeWidth={2.5} />,
  Eye: <Eye size={20} strokeWidth={2.5} />,
  Send: <Send size={20} strokeWidth={2.5} />,
};

const VentureProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [venture, setVenture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);
  const [selectedEngagementType, setSelectedEngagementType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";

  const getMediaUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('/uploads/')) {
       const rootUrl = baseURL.replace(/\/api$/, '');
       return `${rootUrl}${url}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchVenture = async () => {
      try {
        const res = await axios.get(`${baseURL}/ventures/${slug}`);
        setVenture(res.data);
      } catch (err) {
        console.error("Failed to load venture:", err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchVenture();
  }, [slug, baseURL]);

  const handleEngage = async (values: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning("Please log in to submit an engagement.");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${baseURL}/ventures/${venture.id}/engage`,
        {
          engagementType: selectedEngagementType,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          message: values.message,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Engagement submitted successfully!");
      setEngagementModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.error || "Failed to submit engagement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: 'var(--bg-primary)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!venture) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', background: 'var(--bg-primary)', gap: '16px' }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 800 }}>Venture not found</span>
        <button onClick={() => navigate('/')} style={{ background: 'var(--accent-primary)', color: 'black', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', width: '100%', minHeight: '280px', overflow: 'hidden' }}>
        {venture.bannerUrl ? (
          <img
            src={getMediaUrl(venture.bannerUrl)}
            alt={venture.name}
            style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '280px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(10,18,14,0.95) 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Rocket size={80} style={{ color: 'rgba(16,185,129,0.2)' }} />
          </div>
        )}

        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)'
        }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: '16px', left: '16px',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white'
          }}
        >
          <ArrowLeft size={18} />
        </button>
      </div>

      {/* Identity Section */}
      <div style={{ padding: '0 24px', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '16px' }}>
          {venture.logoUrl ? (
            <img
              src={getMediaUrl(venture.logoUrl)}
              alt={venture.name}
              style={{
                width: '72px', height: '72px', borderRadius: '20px', objectFit: 'cover',
                border: '3px solid var(--bg-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}
            />
          ) : (
            <div style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid var(--bg-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              color: 'black', fontWeight: 900, fontSize: '24px'
            }}>
              {venture.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {venture.name}
            </h1>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0', maxWidth: '600px' }}>
          {venture.shortDescription}
        </p>

        {venture.fullDescription && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: 1.7, margin: '0 0 32px 0', maxWidth: '700px' }}>
            {venture.fullDescription}
          </p>
        )}
      </div>

      {/* Action Layer */}
      {venture.engagementTypes?.length > 0 && (
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '12px' }}>
            Engage
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {venture.engagementTypes.map((et: any) => (
              <button
                key={et.id}
                onClick={() => {
                  setSelectedEngagementType(et.label);
                  setEngagementModalOpen(true);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '16px',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  color: 'var(--accent-primary)', fontWeight: 800, fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  cursor: 'pointer', transition: 'all 0.3s'
                }}
                className="hover:bg-[#10B981]/20 hover:border-[#10B981]/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {et.icon && iconMap[et.icon] ? iconMap[et.icon] : <Handshake size={16} />}
                {et.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Feed */}
      <div style={{ padding: '0 24px', paddingBottom: '120px' }}>
        <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '16px' }}>
          Updates
        </span>

        {venture.posts?.length === 0 && (
          <div style={{
            padding: '40px', textAlign: 'center', borderRadius: '20px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 700 }}>No updates yet</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {venture.posts?.map((post: any) => (
            <div
              key={post.id}
              style={{
                padding: '20px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s'
              }}
              className="hover:border-white/10 hover:bg-white/[0.03]"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Calendar size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>

              {post.imageUrl && (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={getMediaUrl(post.imageUrl)} alt="Post attachment" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                </div>
              )}
              {post.videoUrl && (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                  <video src={getMediaUrl(post.videoUrl)} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Modal */}
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          components: {
            Modal: { contentBg: 'transparent', padding: 0, borderRadiusLG: 48, boxShadow: 'none', colorBgMask: 'rgba(0, 0, 0, 0.8)' },
            Input: { colorBgContainer: 'rgba(255, 255, 255, 0.04)', colorBorder: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, controlHeight: 56, activeBorderColor: '#10B981', hoverBorderColor: 'rgba(16, 185, 129, 0.4)' }
          }
        }}
      >
        <Modal
          title={null}
          open={engagementModalOpen}
          onCancel={() => setEngagementModalOpen(false)}
          footer={null}
          width={600}
          destroyOnClose
          centered
          closeIcon={null}
          className="engagement-glass-modal"
        >
          <div className="relative overflow-hidden" style={{
            backgroundColor: 'rgba(10, 18, 14, 0.98)', backdropFilter: 'blur(60px)',
            borderRadius: '32px', border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 40px 120px -20px rgba(0,0,0,0.9)'
          }}>
            <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div style={{ padding: '40px' }} className="relative z-10">
              <button
                onClick={() => setEngagementModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                  {selectedEngagementType}
                </span>
                <h3 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>
                  Connect with {venture.name}
                </h3>
              </div>

              <Form form={form} layout="vertical" onFinish={handleEngage} className="space-y-4">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Form.Item
                    name="contactName"
                    label={<span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Your Name</span>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input placeholder="Full Name" style={{ fontWeight: 700, paddingLeft: '16px', paddingRight: '16px' }} />
                  </Form.Item>
                  <Form.Item
                    name="contactEmail"
                    label={<span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Email</span>}
                    rules={[{ required: true, type: 'email', message: 'Valid email required' }]}
                  >
                    <Input placeholder="email@example.com" style={{ fontWeight: 700, paddingLeft: '16px', paddingRight: '16px' }} />
                  </Form.Item>
                </div>

                <Form.Item
                  name="contactPhone"
                  label={<span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Phone (Optional)</span>}
                >
                  <Input placeholder="+27..." style={{ fontWeight: 700, paddingLeft: '16px', paddingRight: '16px' }} />
                </Form.Item>

                <Form.Item
                  name="message"
                  label={<span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Message</span>}
                >
                  <TextArea
                    rows={4}
                    placeholder="Tell us about your interest or what you'd like to achieve..."
                    style={{ borderRadius: '16px', padding: '16px', fontWeight: 500, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  />
                </Form.Item>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1, height: '52px', borderRadius: '16px',
                      background: 'var(--accent-primary)', color: 'black', border: 'none',
                      fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em',
                      cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEngagementModalOpen(false)}
                    style={{
                      flex: 1, height: '52px', borderRadius: '16px',
                      background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)',
                      fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em',
                      cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default VentureProfilePage;
