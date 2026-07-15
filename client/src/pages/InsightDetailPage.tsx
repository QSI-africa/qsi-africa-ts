import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { ArrowLeft, Zap, Calendar, User } from 'lucide-react';
import api from '../api';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const { Title, Paragraph } = Typography;
const GREEN = '#10B981';

const InsightDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsight();
  }, [id]);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/network/insights/${id}`);
      setInsight(response.data);
    } catch (err: any) {
      console.error("Fetch insight error:", err);
      setError(err.response?.data?.error || "Failed to fetch insight.");
    } finally {
      setLoading(false);
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.qsi.africa/api';
    try {
      const origin = new URL(baseURL).origin;
      return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
    } catch {
      return path;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-tight">Insight Not Found</h2>
        {error && <p className="text-text-secondary mb-6">{error}</p>}
        <button className="qsi-button primary px-8 py-3" onClick={() => navigate('/network')}>Back to Network</button>
      </div>
    );
  }

  const { profile } = insight;
  const authorName = profile?.user?.name || 'Sovereign Author';
  const authorRole = profile?.specialization || 'Verified Expert';
  const authorBio = profile?.bio || '';
  const authorAvatar = profile?.avatarUrl ? getServerUrl(profile.avatarUrl) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Top Bar / Navigation */}
      <UnifiedHeader
        title="Insight Details"
        extra={
          <button 
            onClick={() => profile?.id ? navigate(`/profiles/${profile.id}`) : navigate('/network')}
            className="qsi-button flex items-center gap-2 py-2 px-4"
          >
            <ArrowLeft size={18} /> Back to Profile
          </button>
        }
      />

      {/* Main Content */}
      <article className="max-w-4xl mx-auto w-full p-8 lg:p-12 pt-0 flex-1">
        {/* Insight Header */}
        <header className="mb-12">
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <span className="text-[10px] font-black text-accent-primary uppercase tracking-widest bg-accent-primary/10 px-4 py-1.5 rounded-full border border-accent-primary/20">
              {insight.category || 'INSIGHT'}
            </span>
            <div className="flex items-center gap-2 text-text-tertiary text-xs">
              <Calendar size={14} />
              <span>{formatDate(insight.createdAt)}</span>
            </div>
          </div>

          <h1 className="text-lg lg:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-8">
            {insight.title}
          </h1>

          <div className="h-px bg-border-subtle w-full" />
        </header>

        {/* Insight Content */}
        <section className="prose prose-invert max-w-none mb-16">
          {insight.content.split('\n\n').map((paragraph: string, idx: number) => (
            <p key={idx} className="text-lg lg:text-xl text-text-secondary leading-relaxed mb-8 font-medium">
              {paragraph}
            </p>
          ))}
        </section>

        {/* Author Bio Box */}
        <footer className="bg-bg-secondary border border-border-subtle rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
          <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
             <Zap size={200} className="text-accent-primary" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            {authorAvatar ? (
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border border-border-subtle flex-shrink-0 bg-bg-primary">
                <img src={authorAvatar} className="w-full h-full object-cover" alt={authorName} />
              </div>
            ) : (
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl border border-border-subtle flex items-center justify-center bg-bg-primary text-accent-primary flex-shrink-0">
                <User size={36} />
              </div>
            )}

            <div className="flex-1">
              <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest block mb-1">
                Written By
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                {authorName}
              </h3>
              <p className="text-sm font-bold text-success-green uppercase tracking-wider mb-4">
                {authorRole}
              </p>
              {authorBio && (
                <p className="text-sm text-text-secondary leading-relaxed max-w-xl italic">
                  "{authorBio}"
                </p>
              )}
            </div>

            {profile?.id && (
              <button 
                onClick={() => navigate(`/profiles/${profile.id}`)}
                className="qsi-button primary text-xs font-black uppercase tracking-widest py-3 px-6 rounded-xl mt-4 md:mt-0 flex-shrink-0"
              >
                View Ledger
              </button>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
};

export default InsightDetailPage;
