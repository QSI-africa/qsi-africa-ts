import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Plus, Globe,
  Heart, MessageCircle, Repeat, Send, Trash2, Bookmark,
  Briefcase, Flame, Hammer, Layers, Users, UserCheck, UserPlus, Compass,
  Lightbulb, Building2, MapPin, Image as ImageIcon, Video as VideoIcon, X, Menu
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid, message, Modal, Drawer } from 'antd';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import UnifiedHeader from '../components/layout/UnifiedHeader';

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
  mediaFiles?: { url: string; type: string }[] | null;
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

import PanXPostItem from '../components/panx/PanXPostItem';

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

const EcosystemPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const authContext = useAuth();
  const user = authContext?.user;
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg ?? true;

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'for_panx' | 'for_you' | 'following' | 'friends'>('for_panx');
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{ url: string, type: string }[]>([]);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ media: { url: string, type: 'image' | 'video' }[], initialIndex: number } | null>(null);

  // New ecosystem state
  const [activeMobileTab, setActiveMobileTab] = useState<'feed'>('feed');
  const [isMobileNavDrawerOpen, setIsMobileNavDrawerOpen] = useState(false);

  const fetchPosts = async (pageNum = 1, signal?: AbortSignal) => {
    if (pageNum > 1) setLoadingMore(true);
    try {
      const response = await api.get(`/panx/posts?page=${pageNum}&limit=20`, { signal });
      if (pageNum === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => {
          const newPosts = response.data.posts.filter((p: any) => !prev.find(existing => existing.id === p.id));
          return [...prev, ...newPosts];
        });
      }
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message?.includes('canceled')) {
        console.log('fetchPosts aborted');
        return;
      }
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(1, controller.signal);
    return () => {
      controller.abort();
    };
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Failed to post reply", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
      }));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!user) {
      message.info("Please log in or register to publish threads.");
      navigate('/login');
      return;
    }
    if (!newPostText.trim() && selectedFiles.length === 0) return;
    setSubmittingPost(true);
    try {
      const uploadedMedia = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('category', 'PANX_MEDIA');
        const uploadRes = await api.post("/upload/document", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedMedia.push({
          url: uploadRes.data.document.url,
          type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
        });
      }

      const response = await api.post("/panx/posts", {
        content: newPostText,
        mediaFiles: uploadedMedia.length > 0 ? uploadedMedia : null,
        imageUrl: uploadedMedia.find(m => m.type === 'IMAGE')?.url || null,
        videoUrl: uploadedMedia.find(m => m.type === 'VIDEO')?.url || null,
        mediaType: uploadedMedia[0]?.type || null,
      });
      const newPost = response.data;
      setPosts(prev => [newPost, ...prev]);
      setNewPostText('');
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Failed to delete post", error);
    }
  };

  const filteredPosts = (Array.isArray(posts) ? posts : []).filter(post => {
    if (!post.author) return false;

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const contentMatch = (post.content || '').toLowerCase().includes(q);
      const authorMatch = (post.author.name || '').toLowerCase().includes(q);
      if (!contentMatch && !authorMatch) return false;
    }

    if (activeFilter === 'for_panx') {
      const cat = getAuthorCategory(post.author);
      return cat === 'sovereign_minds' || cat === 'enterprise' || post.author.role === 'ENGINEER' || post.author.role === 'SUPER_USER' || post.author.role === 'ADMIN';
    }
    if (activeFilter === 'for_you') return true;
    if (activeFilter === 'following') return post.author.isFollowing || post.author.id === user?.id;
    if (activeFilter === 'friends') return post.author.isFollowing;
    return true;
  });

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      <UnifiedHeader
        title="PanX Feed"
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingLeft: '24px', paddingRight: '16px', paddingBottom: '4px', flex: 1 }} className="sovereign-header-tabs no-scrollbar">
          {([
            { id: 'for_panx', label: 'For PanX' },
            { id: 'for_you', label: 'For You' },
            { id: 'following', label: 'Following' },
            { id: 'friends', label: 'Friends' }
          ] as const).map(tab => {
            const isSelected = activeFilter === tab.id;
            const getFilterIcon = (filterName: string) => {
              switch (filterName) {
                case 'for_panx': return <Globe size={12} style={{ marginRight: '6px' }} />;
                case 'for_you': return <Compass size={12} style={{ marginRight: '6px' }} />;
                case 'following': return <Users size={12} style={{ marginRight: '6px' }} />;
                case 'friends': return <UserCheck size={12} style={{ marginRight: '6px' }} />;
                default: return <Globe size={12} style={{ marginRight: '6px' }} />;
              }
            };
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`pill ${isSelected ? 'active' : ''}`}
                style={{
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.02em',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'var(--accent-primary-soft)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getFilterIcon(tab.id)}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
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
        {/* Main Layout Grid/Flex Container */}
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          gap: '32px',
          width: '100%',
          alignItems: 'flex-start'
        }}>
          {/* Left/Main Column: Threads Feed */}

          <div style={{
            flex: isDesktop ? '1' : 'none',
            display: 'flex', flexDirection: 'column',
            width: '100%'
          }}>
            {/* Filters moved to UnifiedHeader */}

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
                      borderRadius: "12px"
                    }}
                  />
                  {previewUrls.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '8px' }}>
                      {previewUrls.map((preview, index) => (
                        <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                          {preview.type === 'VIDEO' ? (
                            <video src={preview.url} style={{ maxHeight: '150px', borderRadius: '12px' }} controls />
                          ) : (
                            <img src={preview.url} style={{ maxHeight: '150px', borderRadius: '12px' }} alt="preview" />
                          )}
                          <button onClick={() => removeFile(index)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} className="hover:text-accent-primary hover:bg-white/10">
                        <ImageIcon size={18} />
                        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s', padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} className="hover:text-accent-primary hover:bg-white/10">
                        <VideoIcon size={18} />
                        <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                      </label>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={(!newPostText.trim() && selectedFiles.length === 0) || submittingPost}
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
                        opacity: (newPostText.trim() || selectedFiles.length > 0) && !submittingPost ? 1 : 0.5,
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
                filteredPosts.map(post => (
                  <PanXPostItem
                    key={post.id}
                    post={post}
                    user={user}
                    navigate={navigate}
                    handleFollowToggle={handleFollowToggle}
                    handleDeletePost={handleDeletePost}
                    handleLikeToggle={handleLikeToggle}
                    setActiveReplyPostId={setActiveReplyPostId}
                    activeReplyPostId={activeReplyPostId}
                    handleRepostToggle={handleRepostToggle}
                    setPosts={setPosts}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handlePostReply={handlePostReply}
                    setFullscreenMedia={setFullscreenMedia}
                    api={api}
                    message={message}
                  />
                ))
              )}

              {!loading && filteredPosts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.4 }}>
                  <Globe size={40} style={{ margin: '0 auto 16px auto' }} />
                  <p className="text-sm font-bold uppercase tracking-wider">No posts found</p>
                </div>
              )}

              {hasMore && !loading && filteredPosts.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                  <button
                    onClick={() => fetchPosts(page + 1)}
                    disabled={loadingMore}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!loadingMore) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!loadingMore) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
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
              {/* Removed Explore Demos button */}
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
        </div>
        <Modal
          open={!!fullscreenMedia}
          footer={null}
          onCancel={() => setFullscreenMedia(null)}
          width="100vw"
          style={{ top: 0, padding: 0, margin: 0, maxWidth: '100vw' }}
          styles={{ body: { padding: 0, background: 'black', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } }}
          closeIcon={<span style={{ color: 'white', fontSize: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: '16px', top: '16px', zIndex: 100 }}>✕</span>}
        >
          {fullscreenMedia && (
            <div
              style={{
                display: 'flex',
                width: '100vw',
                height: '100vh',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth'
              }}
              ref={el => {
                if (el && fullscreenMedia.initialIndex > 0 && !el.dataset.scrolled) {
                  setTimeout(() => {
                    el.scrollLeft = fullscreenMedia.initialIndex * window.innerWidth;
                    el.dataset.scrolled = "true";
                  }, 0);
                }
              }}
              className="no-scrollbar"
            >
              {fullscreenMedia.media.map((m, i) => (
                <div
                  key={i}
                  style={{
                    flex: '0 0 100vw',
                    width: '100vw',
                    height: '100vh',
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'black'
                  }}
                >
                  {m.type === 'image' ? (
                    <img src={m.url} alt={`Media ${i}`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  ) : (
                    <video src={m.url} controls autoPlay={i === fullscreenMedia.initialIndex} style={{ width: '100%', height: '100%', display: 'block' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default EcosystemPage;
