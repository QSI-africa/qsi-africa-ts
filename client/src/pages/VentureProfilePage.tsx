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
import PanXPostItem from '../components/panx/PanXPostItem';
import ProfileHeader from '../components/panx/ProfileHeader';

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

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [fullscreenMedia, setFullscreenMedia] = useState<{ media: any[], initialIndex: number } | null>(null);
  
  const { user } = useAuth();

  const [form] = Form.useForm();

  const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
  const api = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const getMediaUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    try {
      const origin = new URL(baseURL).origin;
      return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    } catch {
      return url;
    }
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

  const handleLikeToggle = async (postId: string) => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/panx/posts/${postId}/like`);
      setVenture((prev: any) => ({
        ...prev,
        posts: prev.posts.map((p: any) => p.id === postId ? { ...p, hasLiked: res.data.liked, likesCount: res.data.likesCount } : p)
      }));
    } catch (error) { console.error(error); }
  };

  const handleRepostToggle = async (postId: string) => {
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/panx/posts/${postId}/repost`);
      setVenture((prev: any) => ({
        ...prev,
        posts: prev.posts.map((p: any) => p.id === postId ? { ...p, hasReposted: res.data.reposted, repostsCount: res.data.repostsCount } : p)
      }));
    } catch (error) { console.error(error); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/panx/posts/${postId}`);
      setVenture((prev: any) => ({
        ...prev,
        posts: prev.posts.filter((p: any) => p.id !== postId)
      }));
      message.success("Post deleted");
    } catch (error) { console.error(error); }
  };

  const handlePostReply = async (postId: string) => {
    if (!user) return navigate('/login');
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/panx/posts/${postId}/reply`, { content: replyText });
      setVenture((prev: any) => ({
        ...prev,
        posts: prev.posts.map((p: any) => {
          if (p.id === postId) {
            return {
              ...p,
              repliesCount: p.repliesCount + 1,
              replies: [...(p.replies || []), res.data]
            };
          }
          return p;
        })
      }));
      setReplyText('');
      setActiveReplyPostId(null);
      message.success("Reply added!");
    } catch (error) { console.error(error); }
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
      {/* Standardized Profile Header */}
      <ProfileHeader
        name={venture.name}
        role="VENTURE"
        bio={venture.shortDescription || venture.fullDescription}
        avatarUrl={venture.logoUrl}
        bannerUrl={venture.bannerUrl}
        isVerified={true}
        onBackClick={() => navigate(-1)}
      />

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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
              <PanXPostItem
                key={post.id}
                post={{ ...post, venture }}
                user={user}
                navigate={navigate}
                handleFollowToggle={() => {}} // Ventures don't have user follows yet
                handleDeletePost={handleDeletePost}
                handleLikeToggle={handleLikeToggle}
                setActiveReplyPostId={setActiveReplyPostId}
                activeReplyPostId={activeReplyPostId}
                handleRepostToggle={handleRepostToggle}
                setPosts={(setter: any) => {
                  setVenture((prev: any) => ({
                    ...prev,
                    posts: typeof setter === 'function' ? setter(prev.posts) : setter
                  }));
                }}
                replyText={replyText}
                setReplyText={setReplyText}
                handlePostReply={handlePostReply}
                setFullscreenMedia={setFullscreenMedia}
                api={api}
                message={message}
              />
            ))}
          </div>
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
          width={500}
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

            <div style={{ padding: '24px' }} className="relative z-10">
              <button
                onClick={() => setEngagementModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>
                  {selectedEngagementType}
                </span>
                <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 900, margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
                  Connect with {venture.name}
                </h3>
              </div>

              <Form form={form} layout="vertical" onFinish={handleEngage} className="space-y-3">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
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

        <Modal
          title={null}
          open={postModalOpen}
          onCancel={() => setPostModalOpen(false)}
          footer={null}
          width={600}
          destroyOnClose
          centered
          closeIcon={null}
          className="engagement-glass-modal"
        >
          {selectedPost && (
            <div className="relative overflow-hidden" style={{
              backgroundColor: 'rgba(24, 36, 30, 0.95)', backdropFilter: 'blur(40px)',
              borderRadius: '32px', border: '1px solid rgba(16,185,129,0.2)',
              boxShadow: '0 20px 60px -10px rgba(0,0,0,0.5)'
            }}>
              <div style={{ padding: '32px' }} className="relative z-10">
                <button
                  onClick={() => setPostModalOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 z-50"
                >
                  <X size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', marginTop: '8px' }}>
                  <Calendar size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                    {new Date(selectedPost.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {selectedPost.imageUrl && (
                  <div style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden' }}>
                    <img src={getMediaUrl(selectedPost.imageUrl)} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }} loading="lazy" />
                  </div>
                )}
                
                {selectedPost.videoUrl && (
                  <div style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden' }}>
                    <video src={getMediaUrl(selectedPost.videoUrl)} controls style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }} preload="metadata" />
                  </div>
                )}

                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                  {selectedPost.content}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default VentureProfilePage;
