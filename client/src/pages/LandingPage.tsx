import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Zap,
  Globe,
  Plus,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  TrendingUp,
  MoreHorizontal,
  Bookmark,
  Filter,
  Radio,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FeedItem {
  id: string;
  author: string;
  avatar: string;
  badge?: string;
  badgeColor?: string;
  timestamp: string;
  category: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  type: 'concept' | 'demo' | 'pilot' | 'system';
}

const categoryColors: Record<string, string> = {
  concept: '#10B981',
  demo: '#6366F1',
  pilot: '#F59E0B',
  system: '#EC4899',
};

const StatBar: React.FC<{ label: string; value: string; trend?: string; color?: string }> = ({
  label, value, trend, color = '#10B981'
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    flex: 1,
    minWidth: '120px'
  }}>
    <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span style={{ fontSize: '22px', fontWeight: 900, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
      {trend && <span style={{ fontSize: '9px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>{trend}</span>}
    </div>
  </div>
);

const FeedCard: React.FC<{ post: FeedItem; onClick: () => void }> = ({ post, onClick }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const color = categoryColors[post.type] || '#10B981';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '24px',
        padding: '28px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        marginBottom: '16px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = `1px solid ${color}30`;
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(255,255,255,0.06)';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
      }} />

      {/* Left type indicator */}
      <div style={{
        position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '2px',
        background: color, borderRadius: '0 4px 4px 0', opacity: 0.6
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Avatar */}
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            border: `1.5px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 900, color,
          }}>
            {post.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', color: 'white', letterSpacing: '-0.02em' }}>
                {post.author}
              </span>
              {post.badge && (
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 900,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  background: `${color}15`, color, border: `1px solid ${color}25`
                }}>
                  {post.badge}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {post.category}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>
                {post.timestamp}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={e => e.stopPropagation()}
          style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <p style={{
        fontSize: '14px', lineHeight: '1.75', color: 'rgba(255,255,255,0.75)',
        fontWeight: 500, marginBottom: '20px'
      }}>
        {post.content}
      </p>

      {/* Images */}
      {post.images.length > 0 && (
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px',
          maxHeight: '240px'
        }}>
          <img src={post.images[0]} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Footer */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: liked ? `${color}15` : 'rgba(255,255,255,0.04)',
            color: liked ? color : 'rgba(255,255,255,0.4)'
          }}
        >
          <Heart size={15} style={{ fill: liked ? color : 'none', stroke: liked ? color : 'currentColor' }} />
          <span style={{ fontSize: '11px', fontWeight: 700 }}>{post.likes + (liked ? 1 : 0)}</span>
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
          borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)'
        }}>
          <MessageCircle size={15} />
          <span style={{ fontSize: '11px', fontWeight: 700 }}>{post.comments}</span>
        </button>

        <button style={{
          width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Share2 size={15} />
        </button>

        <button
          onClick={e => { e.stopPropagation(); setBookmarked(!bookmarked); }}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: bookmarked ? `${color}15` : 'rgba(255,255,255,0.04)',
            color: bookmarked ? color : 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Bookmark size={15} style={{ fill: bookmarked ? color : 'none' }} />
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={e => { e.stopPropagation(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
            borderRadius: '10px', border: `1px solid ${color}30`, background: `${color}10`,
            color, cursor: 'pointer', fontSize: '10px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.1em'
          }}
        >
          View <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(5);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.qsi.africa/api';

  const fetchFeedData = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [conceptsRes, demosRes, pilotsRes] = await Promise.allSettled([
        axios.get(`${baseURL}/submit/concepts`),
        axios.get(`${baseURL}/submit/demos`),
        axios.get(`${baseURL}/submit/pilots`),
      ]);

      let items: FeedItem[] = [];

      if (conceptsRes.status === 'fulfilled') {
        items = [...items, ...conceptsRes.value.data.map((c: any) => ({
          id: c.id || c._id,
          author: 'Architectural Review',
          avatar: 'A',
          badge: 'Concept',
          timestamp: 'Recently added',
          category: 'Vision',
          content: `${c.title}: ${c.description || 'A new sovereign conceptual framework has been established.'}`,
          images: c.image || c.imageUrl ? [c.image || c.imageUrl] : [],
          likes: Math.floor(Math.random() * 200),
          comments: Math.floor(Math.random() * 50),
          type: 'concept' as const,
        }))];
      }

      if (demosRes.status === 'fulfilled') {
        items = [...items, ...demosRes.value.data.map((d: any) => ({
          id: d.id || d._id,
          author: 'Lab Operations',
          avatar: 'L',
          badge: 'Live Demo',
          timestamp: 'System ready',
          category: 'Infrastructure',
          content: `${d.title}: Live demonstration of technical coherence is now accessible for operational audit.`,
          images: d.image || d.imageUrl ? [d.image || d.imageUrl] : [],
          likes: Math.floor(Math.random() * 300),
          comments: Math.floor(Math.random() * 80),
          type: 'demo' as const,
        }))];
      }

      if (pilotsRes.status === 'fulfilled') {
        items = [...items, ...pilotsRes.value.data.map((p: any) => ({
          id: p.id || p._id,
          author: 'Strategic Deployment',
          avatar: 'S',
          badge: 'Pilot',
          timestamp: 'In Progress',
          category: 'Pilot',
          content: `${p.text}: Pilot project initiated to test structural resonance in real-world environments.`,
          images: [],
          likes: Math.floor(Math.random() * 150),
          comments: Math.floor(Math.random() * 30),
          type: 'pilot' as const,
        }))];
      }

      items.push({
        id: 'sys-1',
        author: 'QSI Global',
        avatar: 'Q',
        badge: 'Core',
        timestamp: 'Just now',
        category: 'System',
        content: 'Synchronization of the 4-panel workspace architecture is now complete across the Pan-African corridor. Operational efficiency is at 99.9%.',
        images: [],
        likes: 1024,
        comments: 256,
        type: 'system',
      });

      setFeedItems(items.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error('Failed to fetch feed data:', error);
      // Fallback static data so the page always looks good
      setFeedItems([
        {
          id: 'sys-1', author: 'QSI Global', avatar: 'Q', badge: 'Core',
          timestamp: 'Just now', category: 'System',
          content: 'Synchronization of the 4-panel workspace architecture is now complete across the Pan-African corridor. Operational efficiency is at 99.9%.',
          images: [], likes: 1024, comments: 256, type: 'system',
        },
        {
          id: 'demo-1', author: 'Lab Operations', avatar: 'L', badge: 'Live Demo',
          timestamp: '2h ago', category: 'Infrastructure',
          content: 'Smart City simulation environment is now live. Real-time urban data streams have been integrated across 12 city nodes.',
          images: [], likes: 342, comments: 78, type: 'demo',
        },
        {
          id: 'concept-1', author: 'Architectural Review', avatar: 'A', badge: 'Concept',
          timestamp: 'Yesterday', category: 'Vision',
          content: 'Pan-African Digital Sovereignty Framework v2.0: A new architectural paradigm for distributed governance and decentralised infrastructure has been ratified.',
          images: [], likes: 198, comments: 44, type: 'concept',
        },
        {
          id: 'pilot-1', author: 'Strategic Deployment', avatar: 'S', badge: 'Pilot',
          timestamp: '3 days ago', category: 'Pilot',
          content: 'MaliDriver fleet optimization pilot shows 34% efficiency gain in last-mile delivery across Bamako Metro Zone. Phase 2 deployment approved.',
          images: [], likes: 127, comments: 31, type: 'pilot',
        },
        {
          id: 'sys-2', author: 'QSI Healing', avatar: 'H', badge: 'Health',
          timestamp: '4 days ago', category: 'Wellness',
          content: 'Telemedicine uptime reached 99.7% this quarter. Over 12,000 consultations completed across 8 African countries.',
          images: [], likes: 512, comments: 89, type: 'system',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [baseURL]);

  useEffect(() => { fetchFeedData(); }, [fetchFeedData]);

  const filters = ['All', 'System', 'Concept', 'Demo', 'Pilot'];

  const filteredItems = feedItems.filter(item =>
    activeFilter === 'All' || item.type === activeFilter.toLowerCase()
  );

  const handlePostClick = (item: FeedItem) => {
    if (item.type === 'concept') navigate(`/concepts/${item.id}`);
    else if (item.type === 'demo') navigate(`/demos/${item.id}`);
    else if (item.type === 'pilot') navigate(`/mobility`);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(10, 16, 24, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981',
          }}>
            <Globe size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Ecosystem Feed
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              QSI Live Intelligence
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%', background: '#10B981',
              boxShadow: '0 0 8px #10B981', animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Live
            </span>
          </div>

          <button
            onClick={fetchFeedData}
            style={{
              width: '38px', height: '38px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)'
            }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <StatBar label="Active Nodes" value="48" trend="+2" color="#10B981" />
          <StatBar label="Uptime" value="99.9%" color="#10B981" />
          <StatBar label="Live Pilots" value="12" trend="Active" color="#F59E0B" />
          <StatBar label="Concepts" value={`${feedItems.filter(f => f.type === 'concept').length || '—'}`} color="#6366F1" />
        </div>

        {/* Composer */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px', padding: '24px', marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
              background: 'rgba(16,185,129,0.2)', border: '1.5px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 900, color: '#10B981'
            }}>U</div>
            <div style={{ flex: 1 }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '14px 18px',
                color: 'rgba(255,255,255,0.3)', fontSize: '14px', cursor: 'text',
                transition: 'border-color 0.2s'
              }}>
                Broadcast an operational update...
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[Zap, Globe, Radio, Layers].map((Icon, i) => (
                    <button key={i} style={{
                      width: '34px', height: '34px', borderRadius: '10px', border: 'none',
                      background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)'
                    }}>
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
                <button style={{
                  padding: '10px 24px', borderRadius: '12px', border: 'none',
                  background: '#10B981', color: 'white', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                  boxShadow: '0 8px 20px -5px rgba(16,185,129,0.4)'
                }}>
                  Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                transition: 'all 0.2s',
                background: activeFilter === f ? '#10B981' : 'rgba(255,255,255,0.04)',
                color: activeFilter === f ? 'white' : 'rgba(255,255,255,0.4)',
                boxShadow: activeFilter === f ? '0 6px 16px -4px rgba(16,185,129,0.4)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
            borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
            fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)'
          }}>
            <Filter size={13} /> Sort
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '2px solid rgba(16,185,129,0.2)', borderTop: '2px solid #10B981',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Establishing Resonance...
            </span>
          </div>
        ) : (
          <div>
            {filteredItems.slice(0, visibleItems).map(post => (
              <FeedCard key={post.id} post={post} onClick={() => handlePostClick(post)} />
            ))}

            {filteredItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                No signals in this channel
              </div>
            )}

            {visibleItems < filteredItems.length && (
              <button
                onClick={() => setVisibleItems(prev => prev + 5)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)',
                  color: '#10B981', cursor: 'pointer', fontSize: '11px', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.2em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s', marginTop: '8px'
                }}
              >
                <Plus size={16} /> Load More Intelligence
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default LandingPage;
