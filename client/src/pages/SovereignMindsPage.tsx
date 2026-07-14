import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Spin, Alert
} from 'antd';
import { 
  Search, 
  Globe,
  MoreVertical,
  Shield,
  Users,
  SearchCode
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }} className="sovereign-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: `${GREEN}18`, border: `1px solid ${GREEN}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
          }}>
            <Users size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1, textTransform: 'none' }}>
              Sovereign Minds
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, letterSpacing: '0.15em', opacity: 0.8, textTransform: 'none' }}>
              Ecosystem of Excellence
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }} className="sovereign-header-tabs no-scrollbar">
            {[
              { label: 'All Members', key: 'ALL' },
              { label: 'Sovereign Minds', key: 'SOVEREIGN' },
              { label: 'Professionals', key: 'PROFESSIONALS' }
            ].map((tab) => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em',
                  transition: 'all 0.2s',
                  background: activeTab === tab.key ? GREEN : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.4)',
                  boxShadow: activeTab === tab.key ? `0 6px 16px -4px ${GREEN}60` : 'none',
                  textTransform: 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }} className="sovereign-container">
        
        {/* Hero Section */}
        <div style={{
          borderRadius: '24px', overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${GREEN}20`, marginBottom: '40px', padding: '20px 48px',
          display: 'flex', flexDirection: 'column', gap: '32px'
        }} className="sovereign-hero">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Search Bar Redesign */}
          <div style={{ 
            position: 'relative', zIndex: 1, maxWidth: '600px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '2px 2px 2px 10px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }} className="sovereign-search-container">
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
              padding: '10px 24px', fontSize: '11px', fontWeight: 800, textTransform: 'none',
              cursor: 'pointer', boxShadow: `0 4px 12px ${GREEN}40`
            }}>
              Search
            </button>
          </div>

          <div style={{ flexShrink: 0, color: GREEN, opacity: 0.1, position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} className="sovereign-hero-globe">
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
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                         <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           {engineer.user.name}
                           {engineer.isVerified && (
                             <Shield size={16} fill="currentColor" style={{ color: GREEN }} />
                           )}
                         </h3>
                         <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'none', letterSpacing: '0.1em', marginBottom: '12px' }}>{engineer.specialization}</p>
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
        
        @media (max-width: 768px) {
          .sovereign-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            padding: 16px 20px !important;
          }
          .sovereign-header-tabs {
            width: 100% !important;
            display: flex !important;
            overflow-x: auto !important;
            padding-bottom: 4px !important;
            margin-top: 8px !important;
          }
          .sovereign-header-tabs button {
            flex-shrink: 0 !important;
            padding: 6px 12px !important;
            font-size: 10px !important;
          }
          .sovereign-container {
            padding: 16px 12px !important;
          }
          .sovereign-hero {
            padding: 32px 20px !important;
            gap: 20px !important;
            margin-bottom: 24px !important;
          }
          .sovereign-hero-title {
            font-size: 26px !important;
            line-height: 1.2 !important;
            margin-bottom: 12px !important;
          }
          .sovereign-hero-globe {
            display: none !important;
          }
        }
        
        @media (max-width: 500px) {
          .sovereign-search-container {
            flex-direction: column !important;
            padding: 12px !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .sovereign-search-container input {
            padding: 4px 0 !important;
          }
          .sovereign-search-container button {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SovereignMindsPage;
