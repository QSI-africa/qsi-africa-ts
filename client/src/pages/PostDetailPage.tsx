import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, MessageCircle, Repeat, Send, Trash2, Bookmark
} from 'lucide-react';
import { message } from 'antd';
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

const getServerUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  try {
    const origin = new URL(baseURL).origin;
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  } catch {
    return path;
  }
};

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const authContext = useAuth();
  const user = authContext?.user;

  const [post, setPost] = useState<PostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null); // To reply to a reply

  const fetchPost = async (signal?: AbortSignal) => {
    try {
      const response = await api.get(`/panx/posts/${postId}`, { signal });
      setPost(response.data);
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message?.includes('canceled')) return;
      console.error('Failed to fetch post detail:', error);
      message.error("Failed to load thread");
      navigate('/ecosystem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (postId) fetchPost(controller.signal);
    return () => controller.abort();
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!user) return navigate('/login');
    try {
      const response = await api.post(`/panx/posts/${postId}/like`);
      setPost(prev => prev ? { ...prev, hasLiked: response.data.liked, likesCount: response.data.likesCount } : prev);
    } catch (error: any) { console.error(error); }
  };

  const handleRepostToggle = async () => {
    if (!user) return navigate('/login');
    try {
      const response = await api.post(`/panx/posts/${postId}/repost`);
      setPost(prev => prev ? { ...prev, hasReposted: response.data.reposted, repostsCount: response.data.repostsCount } : prev);
    } catch (error: any) { console.error(error); }
  };

  const handleBookmarkToggle = async () => {
    if (!user) return navigate('/login');
    try {
      const response = await api.post(`/panx/posts/${postId}/bookmark`);
      setPost(prev => prev ? { ...prev, hasBookmarked: response.data.bookmarked, bookmarksCount: response.data.bookmarksCount } : prev);
    } catch (error: any) { console.error(error); }
  };

  const handlePostReply = async (parentId?: string) => {
    if (!user) return navigate('/login');
    if (!replyText.trim()) return;
    try {
      await api.post(`/panx/posts/${postId}/reply`, { content: replyText, parentId });
      setReplyText('');
      setActiveReplyId(null);
      fetchPost(); // Refresh thread to get new hierarchy
    } catch (error: any) { console.error(error); }
  };

  const handleReplyLike = async (replyId: string) => {
    if (!user) return navigate('/login');
    try {
      await api.post(`/panx/replies/${replyId}/like`);
      fetchPost(); // Quick refresh
    } catch (error: any) { console.error(error); }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await api.delete(`/panx/replies/${replyId}`);
      fetchPost();
    } catch (error: any) { console.error(error); }
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
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/ecosystem')}
          style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          className="hover:bg-white/10"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0 }}>Thread</h2>
      </div>

      {/* Main Post */}
      <div style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', background: getAvatarColor(post.author.name), color: 'black' }}>
            {getInitials(post.author.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>{post.author.name}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>{formatTimestamp(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '16px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.9)', margin: '16px 0', whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>

        {post.mediaFiles && post.mediaFiles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: post.mediaFiles.length > 1 ? '1fr 1fr' : '1fr', gap: '8px', margin: '0 0 16px 0' }}>
            {post.mediaFiles.map((media, idx) => (
              <div 
                key={idx}
                style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {media.type === 'VIDEO' ? (
                  <video src={getServerUrl(media.url)} controls style={{ width: '100%', maxHeight: '500px', display: 'block' }} />
                ) : (
                  <img src={getServerUrl(media.url)} alt="Post media" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {post.imageUrl && (
              <div style={{ margin: '0 0 16px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={getServerUrl(post.imageUrl)} alt="Post image" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            {post.videoUrl && (
              <div style={{ margin: '0 0 16px 0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <video src={getServerUrl(post.videoUrl)} controls style={{ width: '100%', maxHeight: '500px', display: 'block' }} />
              </div>
            )}
          </>
        )}

        {/* Engagement Stats */}
        <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}><b style={{ color: 'white' }}>{post.repostsCount}</b> Reposts</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}><b style={{ color: 'white' }}>{post.likesCount}</b> Likes</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}><b style={{ color: 'white' }}>{post.bookmarksCount}</b> Bookmarks</span>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button onClick={handleLikeToggle} className={`std-action-btn ${post.hasLiked ? 'active-red' : ''}`} style={{ display: 'flex', gap: '6px' }}>
              <Heart size={20} fill={post.hasLiked ? '#EF4444' : 'none'} />
            </button>
            <button onClick={() => setActiveReplyId(post.id)} className={`std-action-btn ${activeReplyId === post.id ? 'active-green' : ''}`}>
              <MessageCircle size={20} />
            </button>
            <button onClick={handleRepostToggle} className={`std-action-btn ${post.hasReposted ? 'active-green' : ''}`}>
              <Repeat size={20} />
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                message.success('Link copied to clipboard!');
              }}
              className="std-action-btn"
            >
              <Send size={20} />
            </button>
          </div>
          <button onClick={handleBookmarkToggle} className={`std-action-btn ${post.hasBookmarked ? 'active-green' : ''}`}>
            <Bookmark size={20} fill={post.hasBookmarked ? 'var(--accent-primary)' : 'none'} />
          </button>
        </div>

        {/* Reply to main post */}
        {activeReplyId === post.id && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <input 
              type="text" placeholder="Post your reply..."
              value={replyText} onChange={(e) => setReplyText(e.target.value)}
              style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(); }}
              autoFocus
            />
            <button 
              onClick={() => handlePostReply()}
              style={{ background: 'var(--accent-primary)', color: 'black', border: 'none', borderRadius: '12px', padding: '0 20px', fontSize: '13px', fontWeight: 900, cursor: 'pointer' }}
            >
              Reply
            </button>
          </div>
        )}
      </div>

      {/* Replies Threading */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {post.replies.map((reply, index) => (
          <div key={reply.id} style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', background: getAvatarColor(reply.author.name), color: 'black' }}>
                {getInitials(reply.author.name)}
              </div>
              {reply.children && reply.children.length > 0 && (
                <div style={{ width: '2px', flexGrow: 1, background: 'rgba(255, 255, 255, 0.08)', margin: '8px 0', borderRadius: '1px' }} />
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{reply.author.name}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>{formatTimestamp(reply.createdAt)}</span>
                </div>
                {(reply.author.id === user?.id || user?.role === 'SUPER_USER') && (
                  <button onClick={() => handleDeleteReply(reply.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }} className="hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', margin: '4px 0 12px 0' }}>{reply.content}</p>
              
              {/* Action Bar for Reply */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                <button 
                  onClick={() => handleReplyLike(reply.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: reply.hasLiked ? '#EF4444' : 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                >
                  <Heart size={14} fill={reply.hasLiked ? '#EF4444' : 'none'} />
                  <span>{reply.likesCount || ''}</span>
                </button>
                <button 
                  onClick={() => setActiveReplyId(activeReplyId === reply.id ? null : reply.id)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: activeReplyId === reply.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                >
                  <MessageCircle size={14} />
                </button>
              </div>

              {/* Reply to Reply Input */}
              {activeReplyId === reply.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '16px' }}>
                  <input 
                    type="text" placeholder="Write a reply..."
                    value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '8px 12px', color: 'white', fontSize: '13px', outline: 'none' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(reply.id); }}
                    autoFocus
                  />
                  <button onClick={() => handlePostReply(reply.id)} style={{ background: 'var(--accent-primary)', color: 'black', border: 'none', borderRadius: '10px', padding: '0 16px', fontSize: '12px', fontWeight: 900, cursor: 'pointer' }}>Reply</button>
                </div>
              )}

              {/* Nested Replies */}
              {reply.children && reply.children.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {reply.children.map(child => (
                    <div key={child.id} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', background: getAvatarColor(child.author.name), color: 'black' }}>
                        {getInitials(child.author.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{child.author.name}</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>{formatTimestamp(child.createdAt)}</span>
                          </div>
                          {(child.author.id === user?.id || user?.role === 'SUPER_USER') && (
                            <button onClick={() => handleDeleteReply(child.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }} className="hover:text-red-500">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', margin: '4px 0 8px 0' }}>{child.content}</p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                          <button 
                            onClick={() => handleReplyLike(child.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: child.hasLiked ? '#EF4444' : 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                          >
                            <Heart size={13} fill={child.hasLiked ? '#EF4444' : 'none'} />
                            <span>{child.likesCount || ''}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetailPage;
