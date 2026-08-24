import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, message } from "antd";
import { Activity, BookOpen, ExternalLink, Globe, Layers, MessageCircle, Zap } from "lucide-react";
import api from "../api";
import EntityProfileView from "../components/panx/EntityProfileView";
import PanXPostItem from "../components/panx/PanXPostItem";
import { useAuth } from "../context/AuthContext";
import { PanXMediaViewer, PanXMediaViewerState } from "../components/panx/PanXMediaGallery";
import { applyPanXPostUpdates, publishPanXPostUpdate, subscribeToPanXPostUpdates } from "../services/panxPostSync";

type ProfileTabKey = "posts" | "projects" | "insights";

interface EngineerProfile {
  id: string;
  userId: string;
  bio?: string;
  headline?: string;
  specialization?: string;
  bannerUrl?: string;
  isVerified?: boolean;
  followingCount?: number;
  followersCount?: number;
  isFollowing?: boolean;
  user: {
    id?: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  projects?: Array<{
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    status?: string;
  }>;
  insights?: Array<{
    id: string;
    title: string;
    content: string;
    category?: string;
    createdAt: string;
  }>;
}

const getServerUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
  try {
    const origin = new URL(baseURL).origin;
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
  } catch {
    return path;
  }
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user ?? null;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<EngineerProfile | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabKey>("posts");
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [fullscreenMedia, setFullscreenMedia] = useState<PanXMediaViewerState | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const profileResponse = await api.get(`/network/profile/${id}`);
        const nextProfile = profileResponse.data as EngineerProfile;
        const postsResponse = await api.get(`/panx/posts/user/${nextProfile.userId}`, {
          params: { refreshedAt: Date.now() }
        }).catch(() => ({ data: { posts: [] } }));

        if (!isMounted) return;

        setProfile(nextProfile);
        setUserPosts(applyPanXPostUpdates(postsResponse.data.posts || []));
        setFollowerCount(nextProfile.followersCount || 0);
        setIsFollowing(!!nextProfile.isFollowing);
      } catch (error) {
        console.error("Fetch profile error:", error);
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => subscribeToPanXPostUpdates((postId, update) => {
    setUserPosts(prev => prev.map(post => post.id === postId ? { ...post, ...update } : post));
  }), []);

  const sovereignInsights = useMemo(() => profile?.insights || [], [profile]);
  const projects = useMemo(() => profile?.projects || [], [profile]);
  const isOwnProfile = !!profile && !!user && profile.userId === user.id;

  const handleFollowToggle = async () => {
    if (!profile) return;
    if (!user) {
      message.info("Please log in to follow profiles.");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post(`/panx/users/${profile.userId || id}/follow`);
      const nowFollowing = res.data.following;
      setIsFollowing(nowFollowing);
      setFollowerCount((prev) => (nowFollowing ? prev + 1 : Math.max(0, prev - 1)));
    } catch (error) {
      console.error(error);
      message.error("Failed to update follow status.");
    }
  };

  const handleLikeToggle = async (postId: string) => {
    try {
      const res = await api.post(`/panx/posts/${postId}/like`);
      publishPanXPostUpdate(postId, { hasLiked: res.data.liked, likesCount: res.data.likesCount });
      setUserPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, hasLiked: res.data.liked, likesCount: res.data.likesCount }
            : post
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepostToggle = async (postId: string) => {
    try {
      const res = await api.post(`/panx/posts/${postId}/repost`);
      publishPanXPostUpdate(postId, { hasReposted: res.data.reposted, repostsCount: res.data.repostsCount });
      setUserPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, hasReposted: res.data.reposted, repostsCount: res.data.repostsCount }
            : post
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostReply = async (postId: string) => {
    if (!replyText.trim()) return;

    try {
      const res = await api.post(`/panx/posts/${postId}/reply`, { content: replyText });
      publishPanXPostUpdate(postId, { repliesCount: res.data.repliesCount });
      setUserPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                repliesCount: res.data.repliesCount,
                replies: [...(post.replies || []), res.data],
              }
            : post
        )
      );
      setReplyText("");
      setActiveReplyPostId(null);
      message.success("Reply added.");
    } catch (error) {
      console.error(error);
      message.error("Failed to add reply.");
    }
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
        <h2 className="text-2xl font-bold text-red-500 mb-6 tracking-tight">Profile Not Found</h2>
        <button
          className="qsi-button primary px-8 py-3"
          onClick={() => navigate("/network")}
          style={{ textTransform: "none" }}
        >
          Back to Network
        </button>
      </div>
    );
  }

  return (
    <>
      <EntityProfileView
        name={profile.user.name}
        role={profile.specialization || "Pan African Engineer"}
        bio={profile.bio || profile.headline || "Pan African Engineers Entity"}
        avatarUrl={profile.user.avatarUrl}
        bannerUrl={profile.bannerUrl}
        isVerified={profile.isVerified}
        followersCount={followerCount}
        followingCount={profile.followingCount || 0}
        isFollowing={isFollowing}
        onFollowToggle={isOwnProfile ? undefined : handleFollowToggle}
        isOwnProfile={isOwnProfile}
        onBackClick={() => navigate("/network")}
        activeTab={activeProfileTab}
        onTabChange={(tabKey) => setActiveProfileTab(tabKey as ProfileTabKey)}
        extraActions={
          !isOwnProfile ? (
            <button
              onClick={() => navigate(`/inbox?user=${profile.userId}`)}
              style={{
                padding: "8px 18px",
                borderRadius: "12px",
                background: "rgba(0, 135, 81, 0.15)",
                border: "1px solid #008751",
                color: "#008751",
                fontWeight: 800,
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <MessageCircle size={14} /> Message
            </button>
          ) : null
        }
        tabs={[
          { key: "posts", label: "Posts", count: userPosts.length },
          { key: "projects", label: "Project Ledger", count: projects.length },
          { key: "insights", label: "Sovereign Insights", count: sovereignInsights.length },
        ]}
      >
        {!isOwnProfile && (
          <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-10 text-center relative overflow-hidden">
            <Activity size={120} className="absolute -bottom-8 -right-8 opacity-5 text-accent-primary" />
            <h3 className="text-xl font-bold text-white tracking-tight mb-4" style={{ textTransform: "none" }}>
              Engage Professional
            </h3>
            <p className="text-text-secondary text-sm max-w-2xl mx-auto mb-6">
              Open a direct line for collaboration, consultation, and verified ecosystem work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <button
                onClick={() => {
                  if (profile.user.email) {
                    window.location.href = `mailto:${profile.user.email}?subject=Consultation Inquiry`;
                  }
                }}
                className="qsi-button primary flex-1 py-4 font-black text-xs tracking-widest shadow-xl shadow-accent-primary/10"
                style={{ textTransform: "none" }}
              >
                Schedule Consultation
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.post("/messaging/conversations/direct", { targetUserId: profile.userId });
                    navigate("/inbox");
                  } catch (error) {
                    console.error("Failed to start conversation:", error);
                    message.error("Failed to start secure message.");
                  }
                }}
                className="qsi-button flex-1 py-4 font-black text-xs tracking-widest flex items-center justify-center gap-2"
                style={{ textTransform: "none" }}
              >
                <MessageCircle size={16} /> Secure Message
              </button>
            </div>
          </div>
        )}

        {activeProfileTab === "posts" && (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="eyebrow">Platform Activity</span>
                <h2 className="text-3xl font-black text-white tracking-tight">PanX Feed</h2>
              </div>
              <Activity size={32} className="text-accent-primary opacity-10" />
            </div>

            <div className="space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PanXPostItem
                    key={post.id}
                    post={post}
                    user={user}
                    navigate={navigate}
                    handleFollowToggle={() => {}}
                    handleDeletePost={() => {}}
                    handleLikeToggle={handleLikeToggle}
                    setActiveReplyPostId={setActiveReplyPostId}
                    activeReplyPostId={activeReplyPostId}
                    handleRepostToggle={handleRepostToggle}
                    setPosts={setUserPosts}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handlePostReply={handlePostReply}
                    setFullscreenMedia={setFullscreenMedia}
                    api={api}
                    message={message}
                  />
                ))
              ) : (
                <div className="p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center">
                  <Globe size={48} className="mx-auto text-text-tertiary opacity-20 mb-4" />
                  <p className="text-text-tertiary font-bold tracking-widest" style={{ textTransform: "none" }}>
                    No platform activity logged yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeProfileTab === "projects" && (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="eyebrow">Practical Contribution</span>
                <h2 className="text-3xl font-black text-white tracking-tight">Project Ledger</h2>
              </div>
              <Layers size={32} className="text-accent-primary opacity-10" />
            </div>

            <div className="space-y-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div key={project.id} className="feed-card bg-bg-secondary border-border-subtle overflow-hidden p-0 group">
                    {project.imageUrl && (
                      <div className="h-64 border-b border-border-subtle relative overflow-hidden">
                        <img
                          src={getServerUrl(project.imageUrl)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          alt={project.title}
                        />
                      </div>
                    )}
                    <div className="p-8 lg:p-10">
                      <h3 className="text-2xl font-bold text-white tracking-tight mb-4">{project.title}</h3>
                      <p className="text-text-secondary leading-relaxed mb-8">
                        {project.description || "Verified project contribution within the QSI ecosystem."}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50">
                        <div className="flex items-center gap-2 text-text-tertiary">
                          <Layers size={16} />
                          <span className="text-[10px] font-bold tracking-widest" style={{ textTransform: "none" }}>
                            {project.status || "Outcome Verified"}
                          </span>
                        </div>
                        <button className="qsi-button text-xs font-black tracking-widest text-accent-primary hover:underline flex items-center gap-2" style={{ textTransform: "none" }}>
                          View Case Study <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center">
                  <Layers size={48} className="mx-auto text-text-tertiary opacity-20 mb-4" />
                  <p className="text-text-tertiary font-bold tracking-widest" style={{ textTransform: "none" }}>
                    No projects logged yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeProfileTab === "insights" && (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="eyebrow">Intellectual Leadership</span>
                <h2 className="text-3xl font-black text-white tracking-tight">Sovereign Insights</h2>
              </div>
              <BookOpen size={32} className="text-accent-primary opacity-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sovereignInsights.length > 0 ? (
                sovereignInsights.map((insight) => (
                  <div
                    key={insight.id}
                    onClick={() => navigate(`/insights/${insight.id}`)}
                    className="feed-card bg-bg-secondary border-border-subtle p-8 hover:border-accent-primary/40 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[9px] font-black text-text-tertiary tracking-widest bg-bg-primary px-3 py-1 rounded-full border border-border-subtle" style={{ textTransform: "none" }}>
                          {insight.category || "insight"}
                        </span>
                        <span className="text-[9px] font-bold text-text-tertiary">{formatDate(insight.createdAt)}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-tight mb-4 group-hover:text-accent-primary transition-colors">
                        {insight.title}
                      </h4>
                      <p className="text-text-secondary leading-relaxed mb-6 text-xs line-clamp-4">
                        {insight.content}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Zap size={18} className="text-accent-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center">
                  <BookOpen size={48} className="mx-auto text-text-tertiary opacity-20 mb-4" />
                  <p className="text-text-tertiary font-bold tracking-widest" style={{ textTransform: "none" }}>
                    No sovereign insights logged yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="feed-card bg-bg-secondary border-border-subtle p-8 lg:p-10">
          <h4 className="text-[10px] font-black text-text-tertiary tracking-widest mb-6" style={{ textTransform: "none" }}>
            Operational Network
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">Network ID</span>
              <span className="text-xs font-mono text-white">QSI-MIN-{profile.id.slice(-4).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">Status</span>
              <span className="text-xs font-black text-success-green" style={{ textTransform: "none" }}>
                Synchronized
              </span>
            </div>
            <div className="flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
              <span className="text-xs text-text-secondary">Resonance</span>
              <span className="text-xs font-bold text-white">
                {(95 + (profile.user.name.length % 5) + ((profile.bio?.length || 0) % 10) / 10).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </EntityProfileView>

      <PanXMediaViewer state={fullscreenMedia} onClose={() => setFullscreenMedia(null)} />
    </>
  );
};

export default ProfileDetailPage;
