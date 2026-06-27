import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Plus,
  Globe,
  Heart,
  MessageCircle,
  Repeat,
  Send,
  Trash2,
  Bookmark,
  Briefcase,
  Flame,
  Hammer,
  Layers,
  Users,
  UserCheck,
  UserPlus,
  Compass,
  RefreshCw,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Grid } from "antd";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import UnifiedHeader from "../components/layout/UnifiedHeader";

const { useBreakpoint } = Grid;

interface ReplyItem {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    location: string | null;
  };
}

interface PostItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    location: string | null;
    isFollowing: boolean;
  };
  replies: ReplyItem[];
  hasLiked: boolean;
  hasReposted: boolean;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  imageUrl?: string | null;
}

const filterLabels: Record<string, string> = {
  for_you: "For You",
  enterprise: "Enterprise",
  placebo: "Placebo",
  heritage_flame: "Heritage Flame",
  future_craft: "Future Craft",
  sovereign_minds: "Sovereign Minds",
  others: "Others",
  following: "Following"
};

const LandingPage: React.FC = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const authContext = useAuth();
  const user = authContext?.user;

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    | "for_you"
    | "enterprise"
    | "placebo"
    | "heritage_flame"
    | "future_craft"
    | "sovereign_minds"
    | "others"
    | "following"
  >("for_you");
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<
    Record<string, boolean>
  >({});
  const [visibleItems, setVisibleItems] = useState(10);

  const fetchPosts = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/panx/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleInteractionGuard = () => {
    if (!user) {
      navigate("/login");
      return true;
    }
    return false;
  };

  const handleFollowToggle = async (authorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (handleInteractionGuard()) return;
    try {
      const response = await api.post(`/panx/users/${authorId}/follow`);
      const { following } = response.data;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.author?.id === authorId) {
            return {
              ...post,
              author: {
                ...post.author,
                isFollowing: following,
              },
            };
          }
          return post;
        }),
      );
    } catch (error) {
      console.error("Failed to follow/unfollow user", error);
    }
  };

  const handleLikeToggle = async (postId: string) => {
    if (handleInteractionGuard()) return;
    try {
      const response = await api.post(`/panx/posts/${postId}/like`);
      const { liked, likesCount } = response.data;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              hasLiked: liked,
              likesCount,
            };
          }
          return post;
        }),
      );
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleRepostToggle = async (postId: string) => {
    if (handleInteractionGuard()) return;
    try {
      const response = await api.post(`/panx/posts/${postId}/repost`);
      const { reposted, repostsCount } = response.data;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              hasReposted: reposted,
              repostsCount,
            };
          }
          return post;
        }),
      );
    } catch (error) {
      console.error("Failed to toggle repost", error);
    }
  };

  const handlePostReply = async (postId: string) => {
    if (handleInteractionGuard()) return;
    if (!replyText.trim()) return;
    try {
      const response = await api.post(`/panx/posts/${postId}/reply`, {
        content: replyText,
      });
      const newReply = response.data;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              replies: [...post.replies, newReply],
              repliesCount: post.repliesCount + 1,
            };
          }
          return post;
        }),
      );
      setReplyText("");
      setActiveReplyPostId(null);
    } catch (error) {
      console.error("Failed to post reply", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleCreatePost = async () => {
    if (handleInteractionGuard()) return;
    if (!newPostText.trim() && !selectedImage) return;
    setSubmittingPost(true);
    try {
      let uploadedImageUrl = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('document', selectedImage);
        formData.append('category', 'PANX_IMAGE');
        const uploadRes = await api.post("/upload/document", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = uploadRes.data.document.url;
      }

      const response = await api.post("/panx/posts", { content: newPostText, imageUrl: uploadedImageUrl });
      const newPost = response.data;
      setPosts((prev) => [newPost, ...prev]);
      setNewPostText("");
      removeImage();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (handleInteractionGuard()) return;
    if (!window.confirm("Are you sure you want to delete this thread?")) return;
    try {
      await api.delete(`/panx/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#6366F1",
      "#8B5CF6",
      "#EC4899",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getAuthorCategory = (author: any) => {
    if (!author) return "others";

    const org = (author.organization || "").toLowerCase();
    const name = (author.name || "").toLowerCase();
    const role = (author.role || "").toLowerCase();

    if (
      org.includes("placebo") ||
      name.includes("placebo") ||
      role.includes("medical") ||
      role.includes("doctor") ||
      role.includes("healer") ||
      role.includes("wellness") ||
      role.includes("health")
    ) {
      return "placebo";
    }
    if (
      org.includes("heritage") ||
      name.includes("heritage") ||
      org.includes("flame") ||
      name.includes("flame") ||
      role.includes("energy") ||
      role.includes("solar")
    ) {
      return "heritage_flame";
    }
    if (
      org.includes("craft") ||
      name.includes("craft") ||
      org.includes("futurecraft") ||
      name.includes("futurecraft") ||
      role.includes("production") ||
      role.includes("designer") ||
      role.includes("architect") ||
      role.includes("craft")
    ) {
      return "future_craft";
    }
    if (
      org.includes("enterprise") ||
      name.includes("enterprise") ||
      org.includes("capital") ||
      name.includes("capital") ||
      role.includes("admin") ||
      author.role === "SUPER_USER" ||
      author.role === "ADMIN"
    ) {
      return "enterprise";
    }
    if (
      author.role === "ENGINEER" ||
      author.role === "ARCHITECT" ||
      author.role === "QUANTITY_SURVEYOR" ||
      role.includes("engineer") ||
      role.includes("architect") ||
      role.includes("surveyor") ||
      org.includes("sovereign") ||
      role.includes("sovereign")
    ) {
      return "sovereign_minds";
    }

    return "others";
  };

  const filteredPosts = posts.filter((post) => {
    if (!post.author) return false;
    if (activeFilter === "for_you") return true;
    if (activeFilter === "following")
      return post.author.isFollowing || post.author.id === user?.id;
    return getAuthorCategory(post.author) === activeFilter;
  });

  const filterTabs = user
    ? ([
        "for_you",
        "enterprise",
        "placebo",
        "heritage_flame",
        "future_craft",
        "sovereign_minds",
        "others",
        "following",
      ] as const)
    : ([
        "for_you",
        "enterprise",
        "placebo",
        "heritage_flame",
        "future_craft",
        "sovereign_minds",
        "others",
      ] as const);

  return (
    <div
      style={{ height: "100%", overflowY: "auto", background: "transparent" }}
      className="no-scrollbar"
    >
      {/* Sticky Header */}
      <UnifiedHeader
        title="PanX Feed"
        subTitle="QSI Live Intelligence"
        icon={<Globe size={20} />}
       
      />

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Composer or Guest CTA Card */}
        {user ? (
          <div
            style={{
              display: "flex",
              gap: "14px",
              padding: "20px",
              borderRadius: "24px",
              background: "rgba(255, 255, 255, 0.015)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                background: getAvatarColor(user.name || "User"),
                color: "black",
                fontSize: "13px",
              }}
            >
              {getInitials(user.name || "User")}
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <textarea
                placeholder={`whatsOnYourMind, ${user.name?.split(" ")[0] || "builder"}?`}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "60px",
                  background: "transparent",
                  border: "none",
                  resize: "none",
                  color: "white",
                  fontSize: "13.5px",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                }}
              />
              {previewUrl && (
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '8px', marginBottom: '8px' }}>
                  <img src={previewUrl} style={{ maxHeight: '150px', borderRadius: '12px' }} alt="preview" />
                  <button onClick={removeImage} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} className="hover:text-accent-primary hover:bg-white/10">
                    <ImageIcon size={18} />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                  </label>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={(!newPostText.trim() && !selectedImage) || submittingPost}
                  style={{
                    background: "var(--accent-primary)",
                    color: "black",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 20px",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "none",
                    cursor: "pointer",
                    opacity: (newPostText.trim() || selectedImage) && !submittingPost ? 1 : 0.5,
                    transition: "all 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Plus size={12} strokeWidth={3} />
                  {submittingPost ? "posting" : "post"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.015)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 900,
                color: "white",
                letterSpacing: "0.05em",
                textTransform: "none"
              }}
            >
              Join the PanX Ecosystem
            </span>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                maxWidth: "420px",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Log in or register an account to broadcast operational updates, interact with threads, and follow ecosystem builders.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              <button
                className="qsi-btn qsi-btn-primary"
                onClick={() => navigate("/login")}
                style={{
                  padding: "8px 20px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "none"
                }}
              >
                Log In
              </button>
              <button
                className="qsi-btn qsi-btn-secondary"
                onClick={() => navigate("/register")}
                style={{
                  padding: "8px 20px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "none"
                }}
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
            className="no-scrollbar"
          >
            {filterTabs.map((filter) => {
              const isSelected = activeFilter === filter;
              const getFilterIcon = (filterName: string) => {
                switch (filterName) {
                  case "for_you":
                    return (
                      <Compass
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  case "enterprise":
                    return (
                      <Briefcase
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  case "placebo":
                    return (
                      <Heart
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  case "heritage_flame":
                    return (
                      <Flame
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  case "future_craft":
                    return (
                      <Hammer
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  case "sovereign_minds":
                    return (
                      <UserCheck
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  case "others":
                    return (
                      <Layers
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  case "following":
                    return (
                      <Users
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                  default:
                    return (
                      <Globe
                        size={12}
                        style={{
                          marginRight: "6px",
                          transition: "transform 0.3s ease",
                        }}
                        className="filter-icon"
                      />
                    );
                }
              };
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`pill ${isSelected ? "active" : ""}`}
                  style={{
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "11px",
                    letterSpacing: "0.05em",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: isSelected
                      ? "1px solid var(--accent-primary)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(255,255,255,0.02)",
                    color: isSelected
                      ? "var(--accent-primary)"
                      : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector(
                      ".filter-icon",
                    ) as HTMLElement;
                    if (icon) icon.style.transform = "scale(1.2) rotate(10deg)";
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector(
                      ".filter-icon",
                    ) as HTMLElement;
                    if (icon) icon.style.transform = "scale(1) rotate(0deg)";
                  }}
                >
                  {getFilterIcon(filter)}
                  {filterLabels[filter] || filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Threads List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.1)",
                  borderTopColor: "var(--accent-primary)",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : (
            filteredPosts.slice(0, visibleItems).map((post) => {
              const author = post.author;
              if (!author) return null;
              const isFollowing = author.isFollowing;
              const isOwnPost = author.id === user?.id;
              const isBookmarked = !!bookmarkedPosts[post.id];

              return (
                <div
                  key={post.id}
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "20px",
                    borderRadius: "24px",
                    background: "rgba(255, 255, 255, 0.015)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    position: "relative",
                  }}
                >
                  {/* Left Column: Avatar & Thread line */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {/* Profile Picture (Initials Avatar) */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profiles/${author.id}`);
                      }}
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1.5px solid rgba(255, 255, 255, 0.1)",
                        background: getAvatarColor(author.name),
                        color: "black",
                        fontWeight: 800,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {getInitials(author.name)}
                    </div>

                    {/* Vertical Thread Line */}
                    <div
                      style={{
                        width: "2px",
                        flexGrow: 1,
                        background: "rgba(255, 255, 255, 0.06)",
                        margin: "8px 0",
                        borderRadius: "1px",
                      }}
                    />

                    {/* Mini overlapping avatars for replies */}
                    <div
                      style={{
                        display: "flex",
                        position: "relative",
                        width: "28px",
                        height: "20px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {post.replies?.slice(0, 3).map((rep, idx) => (
                        <div
                          key={rep.id}
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            border: "1.5px solid #060b08",
                            position: "absolute",
                            left: idx * 8,
                            zIndex: 3 - idx,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "5px",
                            background: getAvatarColor(
                              rep.author?.name || "User",
                            ),
                            color: "black",
                          }}
                        >
                          {getInitials(rep.author?.name || "U")}
                        </div>
                      ))}
                      {(!post.replies || post.replies.length === 0) && (
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Right Column: Content & Interactivity */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profiles/${author.id}`);
                          }}
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "white",
                            textTransform: "uppercase",
                            cursor: "pointer",
                          }}
                          className="hover:underline"
                        >
                          {author.name}
                        </span>
                        {(author.role === "SUPER_USER" ||
                          author.role === "ADMIN" ||
                          author.role === "ENGINEER") && (
                          <CheckCircle2
                            size={13}
                            fill="var(--accent-primary)"
                            stroke="black"
                            strokeWidth={2.5}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "12px",
                            color: "rgba(255, 255, 255, 0.25)",
                            margin: "0 4px",
                          }}
                        >
                          •
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "rgba(255, 255, 255, 0.4)",
                          }}
                        >
                          {formatTimestamp(post.createdAt)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {!isOwnPost && (
                          <button
                            onClick={(e) => handleFollowToggle(author.id, e)}
                            style={{
                              background: isFollowing
                                ? "rgba(255, 255, 255, 0.03)"
                                : "rgba(16, 185, 129, 0.1)",
                              border: isFollowing
                                ? "1px solid rgba(255, 255, 255, 0.1)"
                                : "1px solid rgba(16, 185, 129, 0.2)",
                              color: isFollowing
                                ? "rgba(255, 255, 255, 0.4)"
                                : "var(--accent-primary)",
                              borderRadius: "12px",
                              padding: "4px 10px",
                              fontSize: "10px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.05)";
                              if (!isFollowing) {
                                e.currentTarget.style.background =
                                  "rgba(16, 185, 129, 0.18)";
                                e.currentTarget.style.borderColor =
                                  "var(--accent-primary)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.background = isFollowing
                                ? "rgba(255, 255, 255, 0.03)"
                                : "rgba(16, 185, 129, 0.1)";
                              e.currentTarget.style.borderColor = isFollowing
                                ? "1.5px solid rgba(255, 255, 255, 0.1)"
                                : "rgba(16, 185, 129, 0.2)";
                            }}
                          >
                            {isFollowing ? (
                              <UserCheck size={11} />
                            ) : (
                              <UserPlus size={11} />
                            )}
                            {isFollowing ? "following" : "follow"}
                          </button>
                        )}
                        {isOwnPost && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="std-delete-btn"
                            title="Delete Post"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p
                      style={{
                        fontSize: "13.5px",
                        lineHeight: "1.5",
                        color: "rgba(255, 255, 255, 0.85)",
                        margin: "0 0 12px 0",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {post.content}
                    </p>

                    {post.imageUrl && (
                      <div style={{ margin: '0 0 16px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={post.imageUrl} alt="Post image" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}

                    {/* Interactive Action Icons Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <button
                        onClick={() => handleLikeToggle(post.id)}
                        className={`std-action-btn ${post.hasLiked ? "active-red" : ""}`}
                        title="Like Post"
                      >
                        <Heart
                          size={15}
                          fill={post.hasLiked ? "#EF4444" : "none"}
                        />
                      </button>

                      <button
                        onClick={() => {
                          if (handleInteractionGuard()) return;
                          setActiveReplyPostId(
                            activeReplyPostId === post.id ? null : post.id,
                          );
                        }}
                        className={`std-action-btn ${activeReplyPostId === post.id ? "active-green" : ""}`}
                        title="Reply to Post"
                      >
                        <MessageCircle size={15} />
                      </button>

                      <button
                        onClick={() => handleRepostToggle(post.id)}
                        className={`std-action-btn ${post.hasReposted ? "active-green" : ""}`}
                        title="Repost"
                      >
                        <Repeat size={15} />
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/#${post.id}`,
                          );
                          alert("linkCopiedToClipboard");
                        }}
                        className="std-action-btn"
                        title="Copy Link to Clipboard"
                      >
                        <Send size={15} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookmarkedPosts((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }));
                        }}
                        className={`std-action-btn ${isBookmarked ? "active-green" : ""}`}
                        title="Bookmark Post"
                      >
                        <Bookmark
                          size={15}
                          fill={isBookmarked ? "var(--accent-primary)" : "none"}
                        />
                      </button>
                    </div>

                    {/* Replies Thread List */}
                    {post.replies && post.replies.length > 0 && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px 16px",
                          background: "rgba(255, 255, 255, 0.01)",
                          borderLeft: "2px solid rgba(16, 185, 129, 0.2)",
                          borderRadius: "0 12px 12px 0",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {post.replies.map((rep) => (
                          <div
                            key={rep.id}
                            style={{ display: "flex", gap: "8px" }}
                          >
                            <div
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "6px",
                                background: getAvatarColor(
                                  rep.author?.name || "User",
                                ),
                                color: "black",
                              }}
                            >
                              {getInitials(rep.author?.name || "U")}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: "rgba(255, 255, 255, 0.7)",
                                  }}
                                >
                                  {rep.author?.name}
                                </span>
                                <span
                                  style={{
                                    fontSize: "9px",
                                    color: "rgba(255, 255, 255, 0.3)",
                                    marginLeft: "6px",
                                  }}
                                >
                                  {formatTimestamp(rep.createdAt)}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontSize: "11.5px",
                                  color: "rgba(255, 255, 255, 0.55)",
                                  margin: "2px 0 0 0",
                                }}
                              >
                                {rep.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input Area */}
                    {activeReplyPostId === post.id && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "12px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="writeAReply"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{
                            flex: 1,
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "12px",
                            padding: "8px 12px",
                            color: "white",
                            fontSize: "12px",
                            outline: "none",
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handlePostReply(post.id);
                          }}
                        />
                        <button
                          onClick={() => handlePostReply(post.id)}
                          style={{
                            background: "var(--accent-primary)",
                            color: "black",
                            border: "none",
                            borderRadius: "12px",
                            padding: "0 16px",
                            fontSize: "11px",
                            fontWeight: 900,
                            textTransform: "none",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Send size={11} />
                          reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {!loading && filteredPosts.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "60px 0", opacity: 0.4 }}
            >
              <Globe size={40} style={{ margin: "0 auto 16px auto" }} />
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "none",
                  letterSpacing: "0.2em",
                }}
              >
                No posts found
              </p>
            </div>
          )}

          {visibleItems < filteredPosts.length && (
            <button
              onClick={() => setVisibleItems((prev) => prev + 10)}
              className="qsi-btn qsi-btn-secondary"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                color: "#10B981",
                textTransform: "none"
              }}
            >
              <Plus size={16} /> Load More Intelligence
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default LandingPage;
