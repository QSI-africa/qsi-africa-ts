import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Plus, Globe, 
  Heart, MessageCircle, Repeat, Send, Trash2, Bookmark,
  Briefcase, Flame, Hammer, Layers, Users, UserCheck, UserPlus, Compass,
  Lightbulb, Building2, MapPin, Image as ImageIcon, Video as VideoIcon, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Grid, message } from 'antd';
import { useAuth } from '../context/AuthContext';
import api from '../api';

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
  hasLiked?: boolean;
  likesCount?: number;
  children?: ReplyItem[];
}

interface PostItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: string | null;
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
  hasBookmarked: boolean;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  sharesCount: number;
  bookmarksCount: number;
}

const getServerUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const origin = new URL(baseURL).origin;
  return `${origin}${path}`;
};

const EcosystemPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const user = authContext?.user;
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg ?? true;

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'for_you' | 'following' | 'saved' | 'enterprise' | 'placebo' | 'heritage_flame' | 'future_craft' | 'sovereign_minds' | 'others'>('for_you');
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  // New ecosystem state
  const [concepts, setConcepts] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [loadingEcosystem, setLoadingEcosystem] = useState(true);
  const [activeMobileTab, setActiveMobileTab] = useState<'feed' | 'concepts' | 'demos'>('feed');

  const fetchPosts = async () => {
    try {
      const response = await api.get('/panx/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEcosystemData = async () => {
    try {
      const [conceptsRes, demosRes] = await Promise.all([
        api.get('/submit/concepts'),
        api.get('/submit/demos')
      ]);
      setConcepts(conceptsRes.data);
      setDemos(demosRes.data);
    } catch (error) {
      console.error('Failed to fetch ecosystem data:', error);
    } finally {
      setLoadingEcosystem(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchEcosystemData();
  }, []);

  const handleFollowToggle = async (authorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      message.info("Please log in or register to follow users.");
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/panx/users/${authorId}/follow`);
      const { following } = response.data;
      setPosts(prev => prev.map(post => {
        if (post.author?.id === authorId) {
          return {
            ...post,
            author: {
              ...post.author,
              isFollowing: following
            }
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to follow/unfollow user", error);
    }
  };

  const handleLikeToggle = async (postId: string) => {
    if (!user) {
      message.info("Please log in or register to like threads.");
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/panx/posts/${postId}/like`);
      const { liked, likesCount } = response.data;
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hasLiked: liked,
            likesCount
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleRepostToggle = async (postId: string) => {
    if (!user) {
      message.info("Please log in or register to repost threads.");
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/panx/posts/${postId}/repost`);
      const { reposted, repostsCount } = response.data;
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hasReposted: reposted,
            repostsCount
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to toggle repost", error);
    }
  };

  const handleBookmarkToggle = async (postId: string) => {
    if (!user) {
      message.info("Please log in or register to bookmark threads.");
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/panx/posts/${postId}/bookmark`);
      const { bookmarked, bookmarksCount } = response.data;
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            hasBookmarked: bookmarked,
            bookmarksCount
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
    }
  };

  const handlePostReply = async (postId: string) => {
    if (!user) {
      message.info("Please log in or register to reply to threads.");
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;
    try {
      const response = await api.post(`/panx/posts/${postId}/reply`, { content: replyText });
      const newReply = response.data;
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [...post.replies, newReply],
            repliesCount: post.repliesCount + 1
          };
        }
        return post;
      }));
      setReplyText('');
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
    if (!user) {
      message.info("Please log in or register to publish threads.");
      navigate('/login');
      return;
    }
    if (!newPostText.trim() && !selectedImage) return;
    setSubmittingPost(true);
    try {
      let uploadedImageUrl = null;
      let uploadedVideoUrl = null;
      let mediaType = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('document', selectedImage);
        formData.append('category', 'PANX_MEDIA');
        const uploadRes = await api.post("/upload/document", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (selectedImage.type.startsWith('video/')) {
          uploadedVideoUrl = uploadRes.data.document.url;
          mediaType = 'VIDEO';
        } else {
          uploadedImageUrl = uploadRes.data.document.url;
          mediaType = 'IMAGE';
        }
      }
      
      const response = await api.post("/panx/posts", { 
        content: newPostText, 
        imageUrl: uploadedImageUrl,
        videoUrl: uploadedVideoUrl,
        mediaType
      });
      const newPost = response.data;
      setPosts(prev => [newPost, ...prev]);
      setNewPostText('');
      removeImage();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this thread?")) return;
    try {
      await api.delete(`/panx/posts/${postId}`);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
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
      "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getAuthorCategory = (author: any) => {
    if (!author) return 'others';
    
    const org = (author.organization || '').toLowerCase();
    const name = (author.name || '').toLowerCase();
    const role = (author.role || '').toLowerCase();

    if (org.includes('placebo') || name.includes('placebo') || role.includes('medical') || role.includes('doctor') || role.includes('healer') || role.includes('wellness') || role.includes('health')) {
      return 'placebo';
    }
    if (org.includes('heritage') || name.includes('heritage') || org.includes('flame') || name.includes('flame') || role.includes('energy') || role.includes('solar')) {
      return 'heritage_flame';
    }
    if (org.includes('craft') || name.includes('craft') || org.includes('futurecraft') || name.includes('futurecraft') || role.includes('production') || role.includes('designer') || role.includes('architect') || role.includes('craft')) {
      return 'future_craft';
    }
    if (org.includes('enterprise') || name.includes('enterprise') || org.includes('capital') || name.includes('capital') || role.includes('admin') || author.role === 'SUPER_USER' || author.role === 'ADMIN') {
      return 'enterprise';
    }
    if (author.role === 'ENGINEER' || author.role === 'ARCHITECT' || author.role === 'QUANTITY_SURVEYOR' || role.includes('engineer') || role.includes('architect') || role.includes('surveyor') || org.includes('sovereign') || role.includes('sovereign')) {
      return 'sovereign_minds';
    }
    
    return 'others';
  };

  const filteredPosts = posts.filter(post => {
    if (!post.author) return false;
    
    if (activeFilter === 'for_you') return true;
    if (activeFilter === 'following') return post.author.isFollowing || post.author.id === user?.id;
    if (activeFilter === 'saved') return post.hasBookmarked;
    return getAuthorCategory(post.author) === activeFilter;
  });

  return (
    <div style={{
      maxWidth: isDesktop ? '1200px' : '700px',
      margin: '0 auto',
      padding: '24px 16px 100px 16px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%'
    }}>
      {!user && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.02) 100%)',
          border: '1px solid rgba(16,185,129,0.12)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Compass size={18} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '13.5px', fontWeight: 800, margin: 0 }}>Browsing Ecosystem in Guest Mode</h4>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '2px 0 0 0' }}>
                Sign in to participate in building threads, following members, publishing concepts, or showcasing smart city demos.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--accent-primary)', border: 'none', color: 'black', padding: '8px 16px',
                borderRadius: '10px', fontWeight: 800, fontSize: '11px', cursor: 'pointer'
              }}
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '11px', cursor: 'pointer'
              }}
            >
              Register
            </button>
          </div>
        </div>
      )}
      {/* Mobile Top Tabs */}
      {!isDesktop && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '8px',
          gap: '16px',
          overflowX: 'auto'
        }} className="no-scrollbar">
          {(['feed', 'concepts', 'demos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveMobileTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeMobileTab === tab ? '2.5px solid var(--accent-primary)' : '2.5px solid transparent',
                color: activeMobileTab === tab ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.6)',
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab === 'feed' ? 'Social Feed' : tab === 'concepts' ? 'Digital Concepts' : 'City Demos'}
            </button>
          ))}
        </div>
      )}

      {/* Main Layout Grid/Flex Container */}
      <div style={{
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        gap: '32px',
        width: '100%',
        alignItems: 'flex-start'
      }}>
        {/* Left/Main Column: Threads Feed */}
        {(isDesktop || activeMobileTab === 'feed') && (
          <div style={{
            flex: isDesktop ? '1' : 'none',
            display: 'flex', flexDirection: 'column',
            width: '100%'
          }}>
            {/* Horizontal Feed Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10, 16, 24, 0.95)', backdropFilter: 'blur(16px)', padding: '12px 0' }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                {(['for_you', 'following', 'saved', 'enterprise', 'placebo', 'heritage_flame', 'future_craft', 'sovereign_minds', 'others'] as const).map(filter => {
                  const isSelected = activeFilter === filter;
                  const getFilterIcon = (filterName: string) => {
                    switch (filterName) {
                      case 'for_you':
                        return <Compass size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'following':
                        return <Users size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'saved':
                        return <Bookmark size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'enterprise':
                        return <Briefcase size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'placebo':
                        return <Heart size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'heritage_flame':
                        return <Flame size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'future_craft':
                        return <Hammer size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'sovereign_minds':
                        return <UserCheck size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      case 'others':
                        return <Layers size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                      default:
                        return <Globe size={12} style={{ marginRight: '6px', transition: 'transform 0.3s ease' }} className="filter-icon" />;
                    }
                  };
                  return (
                    <button 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`pill ${isSelected ? 'active' : ''}`}
                      style={{
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        fontSize: '11px',
                        letterSpacing: '0.05em',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={e => {
                        const icon = e.currentTarget.querySelector('.filter-icon') as HTMLElement;
                        if (icon) icon.style.transform = 'scale(1.2) rotate(10deg)';
                      }}
                      onMouseLeave={e => {
                        const icon = e.currentTarget.querySelector('.filter-icon') as HTMLElement;
                        if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
                      }}
                    >
                      {getFilterIcon(filter)}
                      {filter.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Composer Area */}
            {!user ? (
              <div style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
                marginBottom: '20px'
              }}>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 16px 0' }}>
                  Join the ecosystem thread discussion. Log in or create an account to start sharing posts.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'var(--accent-primary)', border: 'none', color: 'black', padding: '8px 16px',
                      borderRadius: '10px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer'
                    }}
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                      padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer'
                    }}
                  >
                    Register
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                gap: '14px',
                padding: '20px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  background: getAvatarColor(user?.name || 'User'),
                  color: 'black',
                  fontSize: '13px'
                }}>
                  {getInitials(user?.name || 'User')}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'builder'}?`}
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      background: 'transparent',
                      border: 'none',
                      resize: 'none',
                      color: 'white',
                      fontSize: '13.5px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                      padding: "12px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.02)"
                    }}
                  />
                  {previewUrl && (
                    <div style={{ position: 'relative', display: 'inline-block', marginTop: '8px', marginBottom: '8px' }}>
                      {selectedImage?.type.startsWith('video/') ? (
                        <video src={previewUrl} style={{ maxHeight: '150px', borderRadius: '12px' }} controls />
                      ) : (
                        <img src={previewUrl} style={{ maxHeight: '150px', borderRadius: '12px' }} alt="preview" />
                      )}
                      <button onClick={removeImage} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} className="hover:text-accent-primary hover:bg-white/10">
                        <ImageIcon size={18} />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} className="hover:text-accent-primary hover:bg-white/10">
                        <VideoIcon size={18} />
                        <input type="file" accept="video/mp4,video/webm,video/quicktime" style={{ display: 'none' }} onChange={handleImageChange} />
                      </label>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={(!newPostText.trim() && !selectedImage) || submittingPost}
                      style={{
                        background: 'var(--accent-primary)',
                        color: 'black',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '8px 20px',
                        fontSize: '11px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        opacity: (newPostText.trim() || selectedImage) && !submittingPost ? 1 : 0.5,
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={12} strokeWidth={3} />
                      {submittingPost ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Threads list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                filteredPosts.map(post => {
                  const author = post.author;
                  if (!author) return null;
                  const isFollowing = author.isFollowing;
                  const isOwnPost = author.id === user?.id;
                  
                  return (
                    <div 
                      key={post.id}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        padding: '20px',
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.015)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        position: 'relative'
                      }}
                    >
                      {/* Left Column: Avatar & Thread line */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.5px solid rgba(255, 255, 255, 0.1)',
                          background: getAvatarColor(author.name),
                          color: 'black',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}>
                          {getInitials(author.name)}
                        </div>

                        <div style={{
                          width: '2px',
                          flexGrow: 1,
                          background: 'rgba(255, 255, 255, 0.06)',
                          margin: '8px 0',
                          borderRadius: '1px'
                        }} />

                        <div style={{
                          display: 'flex',
                          position: 'relative',
                          width: '28px',
                          height: '20px',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {post.replies?.slice(0, 3).map((rep, idx) => (
                            <div 
                              key={rep.id}
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                border: '1.5px solid #060b08',
                                position: 'absolute',
                                left: idx * 8,
                                zIndex: 3 - idx,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '5px',
                                background: getAvatarColor(rep.author?.name || 'User'),
                                color: 'black'
                              }}
                            >
                              {getInitials(rep.author?.name || 'U')}
                            </div>
                          ))}
                          {(!post.replies || post.replies.length === 0) && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                          )}
                        </div>
                      </div>

                      {/* Right Column: Content & Interactivity */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span 
                              style={{ fontSize: '13px', fontWeight: 800, color: 'white', textTransform: 'uppercase', cursor: 'pointer' }}
                              className="hover:underline"
                            >
                              {author.name}
                            </span>
                            {(author.role === "SUPER_USER" || author.role === "ADMIN" || author.role === "ENGINEER") && (
                              <CheckCircle2 size={13} fill="var(--accent-primary)" stroke="black" strokeWidth={2.5} />
                            )}
                            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.25)', margin: '0 4px' }}>•</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                              {formatTimestamp(post.createdAt)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {!isOwnPost && (
                              <button 
                                onClick={(e) => handleFollowToggle(author.id, e)}
                                style={{
                                  background: isFollowing ? 'rgba(255, 255, 255, 0.03)' : 'rgba(16, 185, 129, 0.1)',
                                  border: isFollowing ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(16, 185, 129, 0.2)',
                                  color: isFollowing ? 'rgba(255, 255, 255, 0.4)' : 'var(--accent-primary)',
                                  borderRadius: '12px',
                                  padding: '4px 10px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                  if (!isFollowing) {
                                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.18)';
                                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                  }
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.background = isFollowing ? 'rgba(255, 255, 255, 0.03)' : 'rgba(16, 185, 129, 0.1)';
                                  e.currentTarget.style.borderColor = isFollowing ? '1.5px solid rgba(255, 255, 255, 0.1)' : 'rgba(16, 185, 129, 0.2)';
                                }}
                              >
                                {isFollowing ? <UserCheck size={11} /> : <UserPlus size={11} />}
                                {isFollowing ? 'Following' : 'Follow'}
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

                        <p style={{
                          fontSize: '13.5px',
                          lineHeight: '1.5',
                          color: 'rgba(255, 255, 255, 0.85)',
                          margin: '0 0 12px 0',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {post.content}
                        </p>
                        
                        {post.imageUrl && (
                          <div style={{ margin: '0 0 16px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={getServerUrl(post.imageUrl)} alt="Post image" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                          </div>
                        )}

                        {post.videoUrl && (
                          <div style={{ margin: '0 0 16px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <video src={getServerUrl(post.videoUrl)} controls style={{ width: '100%', maxHeight: '400px', display: 'block' }} />
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button 
                              onClick={() => handleLikeToggle(post.id)}
                              className={`std-action-btn ${post.hasLiked ? 'active-red' : ''}`}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Heart size={15} fill={post.hasLiked ? '#EF4444' : 'none'} />
                              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.likesCount > 0 ? post.likesCount : ''}</span>
                            </button>

                            <button 
                              onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)}
                              className={`std-action-btn ${activeReplyPostId === post.id ? 'active-green' : ''}`}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <MessageCircle size={15} />
                              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.repliesCount > 0 ? post.repliesCount : ''}</span>
                            </button>

                            <button 
                              onClick={() => handleRepostToggle(post.id)}
                              className={`std-action-btn ${post.hasReposted ? 'active-green' : ''}`}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Repeat size={15} />
                              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.repostsCount > 0 ? post.repostsCount : ''}</span>
                            </button>
                            
                            <button 
                              onClick={() => {
                                api.post(`/panx/posts/${post.id}/share`).then(() => {
                                  setPosts(prev => prev.map(p => p.id === post.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p));
                                });
                                navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                                message.success('Link copied to clipboard!');
                              }}
                              className="std-action-btn"
                              title="Copy link to clipboard"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Send size={15} />
                              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.sharesCount > 0 ? post.sharesCount : ''}</span>
                            </button>
                          </div>
                          <button
                            onClick={() => handleBookmarkToggle(post.id)}
                            className={`std-action-btn ${post.hasBookmarked ? 'active-green' : ''}`}
                            title="Save post"
                          >
                            <Bookmark size={15} fill={post.hasBookmarked ? 'var(--accent-primary)' : 'none'} />
                          </button>
                        </div>

                        {post.replies && post.replies.length > 0 && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.01)',
                            borderLeft: '2px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '0 12px 12px 0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                          }}>
                            {post.replies.map(rep => (
                              <div key={rep.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <div 
                                    style={{ 
                                      width: '18px', 
                                      height: '18px', 
                                      borderRadius: '50%', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      fontWeight: 800,
                                      fontSize: '6px',
                                      background: getAvatarColor(rep.author?.name || 'User'),
                                      color: 'black' 
                                    }} 
                                  >
                                    {getInitials(rep.author?.name || 'U')}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.7)' }}>{rep.author?.name}</span>
                                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', marginLeft: '6px' }}>{formatTimestamp(rep.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.55)', margin: '2px 0 0 0' }}>{rep.content}</p>
                                    
                                    {/* Action Bar for Reply */}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                      <button 
                                        onClick={async () => {
                                          if (!user) return navigate('/login');
                                          try {
                                            const res = await api.post(`/panx/replies/${rep.id}/like`);
                                            setPosts(prev => prev.map(p => p.id === post.id ? {
                                              ...p,
                                              replies: p.replies.map(r => r.id === rep.id ? { ...r, hasLiked: res.data.liked, likesCount: res.data.likesCount } : r)
                                            } : p));
                                          } catch (error) { console.error(error); }
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: rep.hasLiked ? '#EF4444' : 'rgba(255,255,255,0.4)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                                      >
                                        <Heart size={11} fill={rep.hasLiked ? '#EF4444' : 'none'} />
                                        <span>{rep.likesCount || ''}</span>
                                      </button>
                                      <button onClick={() => navigate(`/post/${post.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '10px', cursor: 'pointer', padding: 0 }}>
                                        <MessageCircle size={11} /> Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {/* Show 1 nested reply if any */}
                                {rep.children && rep.children.length > 0 && (
                                  <div style={{ display: 'flex', gap: '8px', marginLeft: '26px' }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '5px', background: getAvatarColor(rep.children[0].author?.name || 'User'), color: 'black' }}>
                                      {getInitials(rep.children[0].author?.name || 'U')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.6)' }}>{rep.children[0].author?.name}</span>
                                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>{rep.children[0].content}</span>
                                      </div>
                                      {rep.children.length > 1 && (
                                        <span onClick={() => navigate(`/post/${post.id}`)} style={{ fontSize: '9px', color: 'var(--accent-primary)', cursor: 'pointer', marginTop: '4px', display: 'inline-block' }}>
                                          View {rep.children.length - 1} more replies
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {post.repliesCount > (post.replies?.length || 0) && (
                          <div style={{ marginTop: '8px', marginLeft: '12px' }}>
                            <span onClick={() => navigate(`/post/${post.id}`)} style={{ fontSize: '11px', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                              View all {post.repliesCount} replies
                            </span>
                          </div>
                        )}

                        {activeReplyPostId === post.id && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <input 
                              type="text" 
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={{
                                flex: 1,
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                color: 'white',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handlePostReply(post.id);
                              }}
                            />
                            <button 
                              onClick={() => handlePostReply(post.id)}
                              style={{
                                background: 'var(--accent-primary)',
                                color: 'black',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '0 16px',
                                fontSize: '11px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Send size={11} />
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {!loading && filteredPosts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.4 }}>
                  <Globe size={40} style={{ margin: '0 auto 16px auto' }} />
                  <p className="text-sm font-bold uppercase tracking-wider">No posts found</p>
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button 
                style={{ flex: 1, height: '48px' }}
                className="qsi-btn qsi-btn-secondary"
                onClick={() => navigate('/demos')}
              >
                Explore Demos
              </button>
              <button 
                style={{ flex: 1, height: '48px' }}
                className="qsi-btn qsi-btn-primary"
                onClick={() => navigate('/chat/infrastructure')}
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Venture
              </button>
            </div>
          </div>
        )}

        {/* Right Column: Concepts & Demos Sidebars (Desktop) OR list items (Mobile when active tab is Concepts or Demos) */}
        {isDesktop ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
            position: 'sticky',
            top: '24px',
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto'
          }} className="no-scrollbar">
            {/* QSI Concepts Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={16} className="text-accent-primary" />
                  <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', margin: 0 }}>
                    QSI Concepts
                  </h3>
                </div>
                <button 
                  onClick={() => navigate('/concepts')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  View All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingEcosystem ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : concepts.slice(0, 3).map(concept => (
                  <div
                    key={concept.id}
                    onClick={() => navigate(`/concepts/${concept.id}`)}
                    style={{
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.015)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                    className="hover:border-accent-primary/30 hover:bg-accent-primary/[0.02]"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{concept.title}</span>
                      <span className="qsi-tag qsi-tag-secondary" style={{ fontSize: '8px', padding: '2px 6px' }}>{concept.category}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {concept.shortDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart City Demos Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} className="text-accent-primary" />
                  <h3 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', margin: 0 }}>
                    Smart City Demos
                  </h3>
                </div>
                <button 
                  onClick={() => navigate('/demos')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  View All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingEcosystem ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : demos.slice(0, 3).map(demo => (
                  <div
                    key={demo.id}
                    onClick={() => navigate(`/demos/${demo.id}`)}
                    style={{
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.015)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                    className="hover:border-accent-primary/30 hover:bg-accent-primary/[0.02]"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'white' }}>{demo.title}</span>
                      <span className="qsi-tag qsi-tag-primary" style={{ fontSize: '8px', padding: '2px 6px' }}>{demo.status || 'PROPOSED'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>
                      <MapPin size={10} className="text-accent-primary" />
                      <span>{demo.city || 'Pan-African'}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {demo.shortDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Mobile content for selected tab */
          activeMobileTab !== 'feed' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeMobileTab === 'concepts' ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-wider text-white">Digital Concepts</h2>
                    <span className="text-[10px] text-white/50">{concepts.length} blueprinted</span>
                  </div>
                  {loadingEcosystem ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : (
                    concepts.map(concept => (
                      <div
                        key={concept.id}
                        onClick={() => navigate(`/concepts/${concept.id}`)}
                        style={{
                          padding: '20px',
                          borderRadius: '24px',
                          background: 'rgba(255, 255, 255, 0.015)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                        className="hover:border-accent-primary hover:bg-accent-primary/[0.02]"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-extrabold text-white" style={{ margin: 0 }}>{concept.title}</h3>
                          <span className="qsi-tag qsi-tag-secondary">{concept.category}</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed" style={{ margin: 0 }}>{concept.shortDescription}</p>
                        <span className="text-[10px] text-accent-primary font-black uppercase tracking-wider mt-2">View Analysis →</span>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-wider text-white">Smart City Demos</h2>
                    <span className="text-[10px] text-white/50">{demos.length} active</span>
                  </div>
                  {loadingEcosystem ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : (
                    demos.map(demo => (
                      <div
                        key={demo.id}
                        onClick={() => navigate(`/demos/${demo.id}`)}
                        style={{
                          padding: '20px',
                          borderRadius: '24px',
                          background: 'rgba(255, 255, 255, 0.015)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                        className="hover:border-accent-primary hover:bg-accent-primary/[0.02]"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-extrabold text-white" style={{ margin: 0 }}>{demo.title}</h3>
                          <span className="qsi-tag qsi-tag-primary">{demo.status || 'PROPOSED'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>
                          <MapPin size={11} className="text-accent-primary" />
                          <span>{demo.city || 'Pan-African'}</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed" style={{ margin: 0 }}>{demo.shortDescription}</p>
                        <span className="text-[10px] text-accent-primary font-black uppercase tracking-wider mt-2">View Demonstrator →</span>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default EcosystemPage;
