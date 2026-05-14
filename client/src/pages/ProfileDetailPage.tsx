import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Avatar, Tag, Space, Button, Skeleton, Empty, Image, Spin } from 'antd';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Globe, 
  Layers,
  Zap,
  BookOpen,
  Calendar,
  Activity,
  MoreVertical,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import api from '../api';

const { Title, Text, Paragraph } = Typography;

const ProfileDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/network/engineers');
      const found = response.data.find((eng: any) => eng.id === id);
      setProfile(found);
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServerUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `https://api.qsi.africa${path}`;
  };

  const mockInsights = [
    { id: '1', title: 'Decolonizing the Urban Grid', date: 'Oct 24', category: 'THOUGHT' },
    { id: '2', title: 'Coherence in Infrastructure', date: 'Oct 12', category: 'DESIGN' },
    { id: '3', title: 'The Psychology of Building', date: 'Sep 28', category: 'MENTAL' },
    { id: '4', title: 'Sovereign Resource Loops', date: 'Sep 15', category: 'ECOLOGY' },
  ];

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
        <h2 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-tight">Profile Not Found</h2>
        <button className="qsi-button primary px-8 py-3" onClick={() => navigate('/network')}>Back to Network</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Hero Section */}
      <header className="p-12 lg:p-20 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/network')}
            className="qsi-button flex items-center gap-2 mb-12 py-2 px-4"
          >
            <ArrowLeft size={18} /> Back to Network
          </button>
          
          <div className="flex flex-col lg:flex-row gap-12 lg:items-end">
            <div className="relative group">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl bg-bg-primary border-4 border-bg-primary overflow-hidden shadow-2xl relative z-10">
                 <img src={getServerUrl(profile.avatarUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={profile.user.name} />
              </div>
              {profile.isVerified && (
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-success-green rounded-2xl flex items-center justify-center text-white border-4 border-bg-secondary z-20 shadow-xl">
                   <ShieldCheck size={24} />
                </div>
              )}
              <div className="absolute inset-0 bg-accent-primary/20 blur-3xl rounded-full opacity-20 -z-10 group-hover:opacity-40 transition-opacity" />
            </div>
            
            <div className="flex-1">
              <span className="eyebrow text-accent-primary">
                {profile.isVerified ? 'Sovereign Mind (Verified)' : 'Professional Member'}
              </span>
              <h1 className="text-4xl lg:text-7xl font-black text-white mt-4 mb-6 uppercase tracking-tighter leading-none">
                {profile.user.name}
              </h1>
              <div className="flex flex-wrap gap-6 items-center mb-8">
                <span className="text-xl font-bold text-success-green uppercase tracking-tight">
                  {profile.specialization}
                </span>
                <div className="hidden md:block w-px h-6 bg-border-subtle" />
                <div className="flex items-center gap-2 text-text-secondary">
                  <Globe size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Pan-African Ecosystem</span>
                </div>
              </div>
              <p className="text-xl text-text-secondary max-w-2xl leading-relaxed italic">
                "{profile.bio || "Dedicated to building the foundations of a sovereign and prosperous African future through excellence in infrastructure and thought leadership."}"
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none">
           <Zap size={600} className="text-accent-primary" />
        </div>
      </header>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        <Row gutter={[48, 48]}>
          <Col xs={24} lg={16}>
             <div className="space-y-16">
                {/* Projects */}
                <div>
                   <div className="flex justify-between items-end mb-10">
                      <div>
                        <span className="eyebrow">Practical Contribution</span>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Project Ledger</h2>
                      </div>
                      <Activity size={32} className="text-accent-primary opacity-10" />
                   </div>

                   <div className="space-y-8">
                      {profile.projects && profile.projects.length > 0 ? (
                        profile.projects.map((proj: any) => (
                          <div key={proj.id} className="feed-card bg-bg-secondary border-border-subtle overflow-hidden p-0 group">
                             <div className="h-64 border-b border-border-subtle relative overflow-hidden">
                                <img src={getServerUrl(proj.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={proj.title} />
                                <div className="absolute top-6 right-6">
                                   <Tag className="rounded-full px-4 py-1 bg-bg-primary/80 backdrop-blur-md border-border-subtle text-accent-primary font-black uppercase text-[9px]">
                                      {proj.status}
                                   </Tag>
                                </div>
                             </div>
                             <div className="p-8 lg:p-12">
                                <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-4">{proj.title}</h3>
                                <p className="text-text-secondary leading-relaxed mb-8">{proj.description}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50">
                                   <div className="flex items-center gap-2 text-text-tertiary">
                                      <Layers size={16} />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">Outcome Verified</span>
                                   </div>
                                   <button className="qsi-button text-xs font-black uppercase tracking-widest text-accent-primary hover:underline flex items-center gap-2">
                                      View Case Study <ExternalLink size={14} />
                                   </button>
                                </div>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-20 border-2 border-dashed border-border-subtle rounded-3xl text-center">
                           <Layers size={48} className="mx-auto text-text-tertiary opacity-20 mb-4" />
                           <p className="text-text-tertiary font-bold uppercase tracking-widest">No Projects Logged Yet</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Insights */}
                <div>
                   <div className="flex justify-between items-end mb-10">
                      <div>
                        <span className="eyebrow">Intellectual Leadership</span>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Sovereign Insights</h2>
                      </div>
                      <BookOpen size={32} className="text-accent-primary opacity-10" />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mockInsights.map((insight) => (
                        <div key={insight.id} className="feed-card bg-bg-secondary border-border-subtle p-8 hover:border-accent-primary/40 transition-all cursor-pointer group">
                           <div className="flex justify-between items-center mb-6">
                              <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest bg-bg-primary px-3 py-1 rounded-full border border-border-subtle">
                                 {insight.category}
                              </span>
                              <span className="text-[9px] font-bold text-text-tertiary uppercase">{insight.date}</span>
                           </div>
                           <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-8 group-hover:text-accent-primary transition-colors">{insight.title}</h4>
                           <div className="flex justify-end">
                              <Zap size={18} className="text-accent-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div className="sticky top-12 space-y-8">
               <div className="feed-card bg-bg-secondary border-border-subtle p-8 text-center relative overflow-hidden">
                  <Activity size={100} className="absolute -bottom-8 -right-8 opacity-5 text-accent-primary" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-6">Engage Professional</h3>
                  <button className="qsi-button primary w-full py-5 font-black uppercase text-xs tracking-widest mb-4 shadow-xl shadow-accent-primary/10">
                     Schedule Consultation
                  </button>
                  <button className="qsi-button w-full py-5 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                     <MessageCircle size={16} /> Secure Message
                  </button>
               </div>

               <div className="feed-card bg-bg-secondary border-border-subtle p-8">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-6">Operational Network</h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">Network ID</span>
                        <span className="text-xs font-mono text-white">QSI-MIN-8271</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">Status</span>
                        <span className="text-xs font-black text-success-green uppercase">Synchronized</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">Resonance</span>
                        <span className="text-xs font-bold text-white">99.4%</span>
                     </div>
                  </div>
               </div>
            </div>
          </Col>
        </Row>
      </section>
    </div>
  );
};

export default ProfileDetailPage;
