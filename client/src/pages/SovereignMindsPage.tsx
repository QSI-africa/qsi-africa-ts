import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Row, Col, Input, 
  Tag, Space, Button, 
  Empty, Badge, Spin, Alert
} from 'antd';
import { 
  Search, 
  ShieldCheck, 
  Globe,
  User,
  Zap,
  MoreVertical,
  Activity,
  ArrowRight,
  Shield,
  Star,
  Users,
  SearchCode
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';

const GREEN = '#10B981';

const SovereignMindsPage: React.FC = () => {
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/network/engineers');
      setEngineers(response.data);
    } catch (err: any) {
      console.error("Fetch data error:", err);
      setError("Failed to load network data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEngineers = useMemo(() => {
    let result = engineers.filter(eng => 
      eng.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eng.specialization && eng.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (activeTab === 'SOVEREIGN') {
      result = result.filter(eng => eng.isVerified);
    } else if (activeTab === 'PROFESSIONALS') {
      result = result.filter(eng => !eng.isVerified);
    }

    return result;
  }, [engineers, searchQuery, activeTab]);

  const getServerUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `https://api.qsi.africa${path}`;
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${GREEN}18`, border: `1px solid ${GREEN}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
          }}>
            <Users size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              SOVEREIGN MINDS
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              Ecosystem of Excellence
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
           {[
             { label: 'All Members', key: 'ALL' },
             { label: 'Verified Minds', key: 'SOVEREIGN' },
             { label: 'Professionals', key: 'PROFESSIONALS' }
           ].map((tab) => (
             <button 
               key={tab.key}
               onClick={() => setActiveTab(tab.key)}
               style={{
                 padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                 fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                 transition: 'all 0.2s',
                 background: activeTab === tab.key ? GREEN : 'rgba(255,255,255,0.04)',
                 color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.4)',
                 boxShadow: activeTab === tab.key ? `0 6px 16px -4px ${GREEN}60` : 'none',
               }}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Hero Section */}
        <div style={{
          borderRadius: '24px', overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${GREEN}20`, marginBottom: '40px', padding: '56px 48px',
          display: 'flex', flexDirection: 'column', gap: '32px'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
              Collective of Decolonized Thinkers
            </p>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
              Intellectual Leadership<br />across the Renaissance
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '560px' }}>
              Connecting high-trust network interactions with visionary minds driving mental transformation and innovation.
            </p>
          </div>

          {/* Search Bar Redesign */}
          <div style={{ 
            position: 'relative', zIndex: 1, maxWidth: '600px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '4px 4px 4px 20px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}>
            <Search size={18} color="rgba(255,255,255,0.3)" />
            <input 
              style={{
                background: 'none', border: 'none', outline: 'none', color: 'white',
                padding: '12px 16px', flex: 1, fontSize: '14px', fontWeight: 500
              }}
              placeholder="Search by name, expertise, or mission..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button style={{
              background: GREEN, color: 'white', border: 'none', borderRadius: '12px',
              padding: '10px 24px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
              cursor: 'pointer', boxShadow: `0 4px 12px ${GREEN}40`
            }}>
              Search
            </button>
          </div>

          <div style={{ flexShrink: 0, color: GREEN, opacity: 0.1, position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }}>
            <Globe size={240} />
          </div>
        </div>

        {error && (
          <Alert 
            message={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: '32px', borderRadius: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }} 
          />
        )}

        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center' }}><Spin /></div>
        ) : filteredEngineers.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredEngineers.map(engineer => (
              <Col xs={24} lg={12} key={engineer.id}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '24px', padding: '24px', height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${GREEN}40`;
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
                onClick={() => navigate(`/profiles/${engineer.id}`)}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ 
                        width: '72px', height: '72px', borderRadius: '20px', overflow: 'hidden',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'
                      }}>
                        <img src={getServerUrl(engineer.avatarUrl)} alt={engineer.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      {engineer.isVerified && (
                        <div style={{ 
                          position: 'absolute', bottom: '-4px', right: '-4px',
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: GREEN, border: '3px solid #0a1018',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                          <Shield size={12} fill="currentColor" />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                         <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>{engineer.user.name}</h3>
                         <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{engineer.specialization}</p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {engineer.bio}
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {engineer.skills?.slice(0, 3).map((skill: string, i: number) => (
                          <span key={i} style={{ 
                            fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', 
                            background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ padding: '100px 0', textAlign: 'center' }}>
             <SearchCode size={64} color="rgba(255,255,255,0.05)" style={{ marginBottom: '24px' }} />
             <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>No Matches Found</h3>
             <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>Adjust your search parameters for better synchronization.</p>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SovereignMindsPage;
