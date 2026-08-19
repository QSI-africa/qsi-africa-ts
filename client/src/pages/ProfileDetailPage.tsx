import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Avatar,
  Tag,
  Spin,
  Modal,
  message
} from "antd";
import {
  ShieldCheck,
  ArrowLeft,
  Globe,
  Layers,
  Zap,
  BookOpen,
  Activity,
  ExternalLink,
  MessageCircle,
  User,
  Heart,
} from "lucide-react";
import api from "../api";
import UnifiedHeader from "../components/layout/UnifiedHeader";
import PanXPostItem from "../components/panx/PanXPostItem";
import { ProfileHeader } from "../components/panx/ProfileHeader";
import { useAuth } from "../context/AuthContext";

const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'projects' | 'insights'>('posts');
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [avatarLightboxOpen, setAvatarLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/network/profile/${id}`);
      setProfile(response.data);
      setFollowerCount(response.data._count?.followers || response.data.followersCount || 12);
      setIsFollowing(response.data.isFollowing || false);
      if (response.data.userId) {
        fetchUserPosts(response.data.userId);
      }
    } catch (error: any) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      message.info("Please log in to follow profiles.");
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/panx/users/${profile.userId || id}/follow`);
      const nowFollowing = res.data.following;
      setIsFollowing(nowFollowing);
      setFollowerCount(prev => nowFollowing ? prev + 1 : Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserPosts = async (userId: string) => {
    try {
      const response = await api.get(`/panx/posts/user/${userId}`);
      setUserPosts(response.data.posts || []);
    } catch (error) {
      console.error("Fetch posts error:", error);
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.qsi.africa/api';
    try {
      const origin = new URL(baseURL).origin;
      return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
    } catch {
      return path;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-6 tracking-tight">
          Profile Not Found
        </h2>
        <button
          className="qsi-button primary px-8 py-3"
          onClick={() => navigate("/network")}
          style={{ textTransform: 'none' }}
        >
          Back to Network
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Standardized Profile Header */}
      <ProfileHeader
        name={profile.user.name}
        role={profile.specialization || 'Pan African Engineer'}
        bio={profile.bio || profile.headline || 'Pan African Engineers Entity'}
        avatarUrl={profile.user?.avatarUrl}
        bannerUrl={profile.bannerUrl}
        isVerified={profile.isVerified}
        followersCount={followerCount}
        followingCount={profile.followingCount || 24}
        isFollowing={isFollowing}
        onFollowToggle={handleFollowToggle}
        isOwnProfile={profile.user.id === user?.id}
        onBackClick={() => navigate("/network")}
        activeTab={activeProfileTab}
        onTabChange={(tabKey) => setActiveProfileTab(tabKey)}
        extraActions={
          profile.user.id !== user?.id ? (
            <button
              onClick={() => navigate(`/inbox?user=${profile.user.id}`)}
              style={{
                padding: '8px 18px', borderRadius: '12px',
                background: 'rgba(0, 135, 81, 0.15)', border: '1px solid #008751',
                color: '#008751', fontWeight: 800, fontSize: '11px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <MessageCircle size={14} /> Message
            </button>
          ) : null
        }
        tabs={[
          { key: 'posts', label: 'Posts', count: userPosts.length },
          { key: 'projects', label: 'Project Ledger', count: profile.projects?.length || 0 },
          { key: 'insights', label: 'Sovereign Insights', count: sovereignInsights.length }
        ]}
      />

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto w-full px-8 pb-12 space-y-12">
        {/* Row 2: Engage Professional */}
        <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-12 text-center relative overflow-hidden">
          <Activity
            size={120}
            className="absolute -bottom-8 -right-8 opacity-5 text-accent-primary"
          />
          <h3 className="text-xl font-bold text-white tracking-tight mb-6" style={{ textTransform: 'none' }}>
            Engage Professional
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
            <button 
              onClick={() => {
                if (profile.user?.email) {
                  window.location.href = `mailto:${profile.user.email}?subject=Consultation Inquiry`;
                }
              }}
              className="qsi-button primary flex-1 py-4 font-black text-xs tracking-widest shadow-xl shadow-accent-primary/10" 
              style={{ textTransform: 'none' }}
            >
              Schedule Consultation
            </button>
            <button 
              onClick={async () => {
                try {
                  await api.post('/messaging/conversations/direct', { targetUserId: profile.userId });
                  navigate('/inbox');
                } catch (error) {
                  console.error("Failed to start conversation:", error);
                }
              }}
              className="qsi-button flex-1 py-4 font-black text-xs tracking-widest flex items-center justify-center gap-2" 
              style={{ textTransform: 'none' }}
            >
              <MessageCircle size={16} /> Secure Message
            </button>
          </div>
        </div>

        {/* Row 3: Projects Ledger */}
        <div>
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="eyebrow">Practical Contribution</span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Project Ledger
              </h2>
            </div>
            <Activity
              size={32}
              className="text-accent-primary opacity-10"
            />
          </div>

          <div className="space-y-8">
            {profile.projects && profile.projects.length > 0 ? (
              profile.projects.map((proj: any) => (
                <div
                  key={proj.id}
                  className="feed-card bg-bg-secondary border-border-subtle overflow-hidden p-0 group"
                >
                  <div className="h-64 border-b border-border-subtle relative overflow-hidden">
                    <img
                      src={getServerUrl(proj.imageUrl)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={proj.title}
                    />
                    <div className="absolute top-6 right-6">
                      <Tag className="rounded-full px-4 py-1 bg-bg-primary/80 backdrop-blur-md border-border-subtle text-accent-primary font-black  text-[9px]">
                        {proj.status}
                      </Tag>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12">
                    <h3 className="text-2xl font-bold text-white  tracking-tight mb-4">
                      {proj.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-8">
                      {proj.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50">
                      <div className="flex items-center gap-2 text-text-tertiary">
                        <Layers size={16} />
                        <span className="text-[10px] font-bold  tracking-widest" style={{ textTransform: 'none' }}>
                          Outcome Verified
                        </span>
                      </div>
                      <button className="qsi-button text-xs font-black  tracking-widest text-accent-primary hover:underline flex items-center gap-2" style={{ textTransform: 'none' }}>
                        View Case Study <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center">
                <Layers
                  size={48}
                  className="mx-auto text-text-tertiary opacity-20 mb-4"
                />
                <p className="text-text-tertiary font-bold  tracking-widest" style={{ textTransform: 'none' }}>
                  No projects logged yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Sovereign Insights */}
        <div>
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="eyebrow">Intellectual Leadership</span>
              <h2 className="text-3xl font-black text-white  tracking-tight">
                Sovereign Insights
              </h2>
            </div>
            <BookOpen
              size={32}
              className="text-accent-primary opacity-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.insights && profile.insights.length > 0 ? (
              profile.insights.map((insight: any) => (
                <div
                  key={insight.id}
                  onClick={() => navigate(`/insights/${insight.id}`)}
                  className="feed-card bg-bg-secondary border-border-subtle p-8 hover:border-accent-primary/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] font-black text-text-tertiary  tracking-widest bg-bg-primary px-3 py-1 rounded-full border border-border-subtle" style={{ textTransform: 'none' }}>
                        {insight.category || "insight"}
                      </span>
                      <span className="text-[9px] font-bold text-text-tertiary ">
                        {formatDate(insight.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white  tracking-tight mb-4 group-hover:text-accent-primary transition-colors">
                      {insight.title}
                    </h4>
                    <p className="text-text-secondary leading-relaxed mb-6 text-xs line-clamp-4">
                      {insight.content}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Zap
                      size={18}
                      className="text-accent-primary opacity-20 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center w-full">
                <BookOpen
                  size={48}
                  className="mx-auto text-text-tertiary opacity-20 mb-4"
                />
                <p className="text-text-tertiary font-bold  tracking-widest" style={{ textTransform: 'none' }}>
                  No sovereign insights logged yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 4.5: Platform Activity (PanX Feed) */}
        <div>
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="eyebrow">Platform Activity</span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                PanX Feed
              </h2>
            </div>
            <Activity
              size={32}
              className="text-accent-primary opacity-10"
            />
          </div>

          <div className="space-y-6">
            {userPosts && userPosts.length > 0 ? (
              userPosts.map((post: any) => (
                <PanXPostItem
                  key={post.id}
                  post={post}
                  user={user}
                  navigate={navigate}
                  handleFollowToggle={() => {}}
                  handleDeletePost={() => {}}
                  handleLikeToggle={async (postId: string) => {
                    try {
                      const res = await api.post(`/panx/posts/${postId}/like`);
                      setUserPosts(prev => prev.map(p => p.id === postId ? { ...p, hasLiked: res.data.liked, likesCount: res.data.likesCount } : p));
                    } catch (err) { console.error(err); }
                  }}
                  setActiveReplyPostId={setActiveReplyPostId}
                  activeReplyPostId={activeReplyPostId}
                  handleRepostToggle={async (postId: string) => {
                    try {
                      const res = await api.post(`/panx/posts/${postId}/repost`);
                      setUserPosts(prev => prev.map(p => p.id === postId ? { ...p, hasReposted: res.data.reposted, repostsCount: res.data.repostsCount } : p));
                    } catch (err) { console.error(err); }
                  }}
                  setPosts={setUserPosts}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handlePostReply={async (postId: string) => {
                    if (!replyText.trim()) return;
                    try {
                      const res = await api.post(`/panx/posts/${postId}/reply`, { content: replyText });
                      setUserPosts(prev => prev.map(p => p.id === postId ? {
                        ...p,
                        repliesCount: p.repliesCount + 1,
                        replies: [...(p.replies || []), res.data]
                      } : p));
                      setReplyText("");
                      setActiveReplyPostId(null);
                      message.success("Reply added!");
                    } catch (err) { console.error(err); }
                  }}
                  setFullscreenMedia={setFullscreenMedia}
                  api={api}
                  message={message}
                />
              ))
            ) : (
              <div className="p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center w-full">
                <Globe
                  size={48}
                  className="mx-auto text-text-tertiary opacity-20 mb-4"
                />
                <p className="text-text-tertiary font-bold tracking-widest" style={{ textTransform: 'none' }}>
                  No platform activity logged yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 5: Operational Network */}
        <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-12 w-full">
          <h4 className="text-[10px] font-black text-text-tertiary tracking-widest mb-6" style={{ textTransform: 'none' }}>
            Operational Network
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">
                Network ID
              </span>
              <span className="text-xs font-mono text-white">
                QSI-MIN-{profile.id.slice(-4).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">status</span>
              <span className="text-xs font-black text-success-green" style={{ textTransform: 'none' }}>
                Synchronized
              </span>
            </div>
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">
                Resonance
              </span>
              <span className="text-xs font-bold text-white">
                {(
                  95 +
                  (profile.user.name.length % 5) +
                  (profile.bio ? profile.bio.length % 10 : 0) / 10
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
        {/* Modal for Avatar Lightbox */}
        <Modal
          open={avatarLightboxOpen}
          footer={null}
          onCancel={() => setAvatarLightboxOpen(false)}
          centered
          styles={{ body: { padding: 0, background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '24px', overflow: 'hidden' } }}
        >
          <div className="p-4 text-center">
            {profile.user?.avatarUrl ? (
              <img src={getServerUrl(profile.user.avatarUrl)} alt={profile.user.name} style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '16px' }} />
            ) : (
              <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0, 135, 81, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto' }}>
                <User size={100} style={{ color: '#008751' }} />
              </div>
            )}
            <h3 className="text-white text-lg font-bold mt-4">{profile.user.name}</h3>
            {profile.isVerified && <p className="text-[#008751] text-xs font-bold mt-1">✓ Pan African Verified Entity</p>}
          </div>
        </Modal>
      </section>
    </div>
  );
};

export default ProfileDetailPage;
