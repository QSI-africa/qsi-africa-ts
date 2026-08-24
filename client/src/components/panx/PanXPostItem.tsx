import React from 'react';
import { Heart, MessageCircle, Repeat, Send, Trash2, CheckCircle2, UserCheck, UserPlus } from 'lucide-react';
import { PanXMediaGallery, PanXMediaItem } from './PanXMediaGallery';

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

const PanXPostItem = React.memo(({
  post,
  user,
  navigate,
  handleFollowToggle,
  handleDeletePost,
  handleLikeToggle,
  setActiveReplyPostId,
  activeReplyPostId,
  handleRepostToggle,
  setPosts,
  replyText,
  setReplyText,
  handlePostReply,
  setFullscreenMedia,
  api,
  message
}: any) => {

  // Modify author rendering if it's a Venture post
  const isVenturePost = !!post.venture;
  let author = post.author;
  
  if (isVenturePost) {
    author = {
      ...author,
      name: post.venture.name,
      isFollowing: false, // Ventures don't have direct follows here yet
      role: 'VENTURE',
      avatarUrl: post.venture.logoUrl
    };
  }

  if (!author) return null;
  const isFollowing = author.isFollowing;
  const isOwnPost = !isVenturePost && author.id === user?.id;

  const displayReplies = post.replies ? post.replies.slice(0, 2) : []; // Limit to 2 replies directly
  const hasMoreReplies = post.repliesCount > displayReplies.length;
  const mediaItems: PanXMediaItem[] = post.mediaFiles?.length
    ? post.mediaFiles.map((media: any) => ({
        url: getServerUrl(media.url),
        type: media.type?.toUpperCase() === 'VIDEO' ? 'video' : 'image'
      }))
    : [
        ...(post.imageUrl ? [{ url: getServerUrl(post.imageUrl), type: 'image' as const }] : []),
        ...(post.videoUrl ? [{ url: getServerUrl(post.videoUrl), type: 'video' as const }] : [])
      ];

  return (
    <div
      key={post.id}
      onClick={() => navigate(`/post/${post.id}`)}
      className="panx-content-card"
      style={{
        display: 'flex',
        gap: '14px',
        padding: '20px',
        borderRadius: '24px',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* Left Column: Avatar & Thread line */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {author.avatarUrl ? (
          <img 
            src={getServerUrl(author.avatarUrl)} 
            alt={author.name}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid rgba(255, 255, 255, 0.1)'
            }}
          />
        ) : (
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
        )}

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
          {post.replies?.slice(0, 3).map((rep: any, idx: number) => (
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
              style={{ fontSize: '13px', fontWeight: 800, color: 'white', textTransform: 'capitalize', cursor: 'pointer' }}
              className="hover:underline"
              onClick={(e) => { 
                e.stopPropagation(); 
                if (isVenturePost) {
                  navigate(`/ventures/${post.venture.id}`);
                } else {
                  navigate(`/profiles/${author.id}`); 
                }
              }}
            >
              {author.name}
            </span>
            {(author.role === "SUPER_USER" || author.role === "ADMIN" || author.role === "ENGINEER") && !isVenturePost && (
              <CheckCircle2 size={13} fill="var(--accent-primary)" stroke="black" strokeWidth={2.5} />
            )}
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.25)', margin: '0 4px' }}>•</span>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
              {formatTimestamp(post.createdAt)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isOwnPost && !isVenturePost && (
              <button
                onClick={(e) => { e.stopPropagation(); handleFollowToggle(author.id, e); }}
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
                onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
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

        {mediaItems.length > 0 && (
          <PanXMediaGallery
            media={mediaItems}
            onOpen={(initialIndex) => setFullscreenMedia({ media: mediaItems, initialIndex })}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleLikeToggle(post.id); }}
              className={`std-action-btn ${post.hasLiked ? 'active-red' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Heart size={15} fill={post.hasLiked ? '#EF4444' : 'none'} />
              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.likesCount ?? 0}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id); }}
              className={`std-action-btn ${activeReplyPostId === post.id ? 'active-green' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MessageCircle size={15} />
              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.repliesCount ?? 0}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleRepostToggle(post.id); }}
              className={`std-action-btn ${post.hasReposted ? 'active-green' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Repeat size={15} />
              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.repostsCount ?? 0}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                api.post(`/panx/posts/${post.id}/share`).then(() => {
                  setPosts((prev: any[]) => prev.map(p => p.id === post.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p));
                });
                navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                message.success('Link copied to clipboard!');
              }}
              className="std-action-btn"
              title="Copy link to clipboard"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} />
              <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{post.sharesCount ?? 0}</span>
            </button>
          </div>
        </div>

        {displayReplies && displayReplies.length > 0 && (
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
            {displayReplies.map((rep: any) => (
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
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!user) return navigate('/login');
                          try {
                            const res = await api.post(`/panx/replies/${rep.id}/like`);
                            setPosts((prev: any[]) => prev.map(p => p.id === post.id ? {
                              ...p,
                              replies: p.replies.map((r: any) => r.id === rep.id ? { ...r, hasLiked: res.data.liked, likesCount: res.data.likesCount } : r)
                            } : p));
                          } catch (error: any) { console.error(error); }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: rep.hasLiked ? '#EF4444' : 'rgba(255,255,255,0.4)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                      >
                        <Heart size={11} fill={rep.hasLiked ? '#EF4444' : 'none'} />
                        <span>{rep.likesCount || ''}</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '10px', cursor: 'pointer', padding: 0 }}>
                        <MessageCircle size={11} /> Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMoreReplies && (
              <div style={{ marginTop: '4px', paddingLeft: '26px' }}>
                <span onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }} style={{ fontSize: '11px', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  View more comments
                </span>
              </div>
            )}
          </div>
        )}

        {post.repliesCount > 0 && !hasMoreReplies && post.repliesCount > (displayReplies.length || 0) && (
          <div style={{ marginTop: '8px', marginLeft: '12px' }}>
            <span onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }} style={{ fontSize: '11px', color: 'var(--accent-primary)', cursor: 'pointer' }}>
              View all {post.repliesCount} replies
            </span>
          </div>
        )}

        {activeReplyPostId === post.id && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }} onClick={e => e.stopPropagation()}>
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
});

export default PanXPostItem;
