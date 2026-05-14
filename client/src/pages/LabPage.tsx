import React, { useState, useEffect } from 'react';
import { Typography, Tag, Spin, Space, Empty } from 'antd';
import { 
  Play, 
  ArrowRight, 
  Code, 
  Rocket, 
  Lightbulb,
  Zap,
  Activity,
  Radio,
  ExternalLink,
  FlaskConical,
  Dna,
  Cpu,
  Binary,
  Layers,
  ChevronRight
} from 'lucide-react';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GREEN = '#10B981';

const LabPage: React.FC = () => {
  const { token } = useAuth() || { token: null };
  const navigate = useNavigate();
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch Lab Categories
    const fetchLabData = async () => {
      try {
        const res = await fetch('/api/lab/categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch lab categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabData();

    socketService.connect(token || undefined);

    socketService.on('broadcast-list-updated', (streams: any[]) => {
      if (streams.length > 0) {
        setActiveBroadcast(streams[0]);
      } else {
        setActiveBroadcast(null);
      }
    });

    socketService.emit('get-active-broadcasts');

    return () => {
      socketService.off('broadcast-list-updated');
    };
  }, [token]);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'CodeOutlined': return <Code size={20} />;
      case 'BulbOutlined': return <Lightbulb size={20} />;
      default: return <Zap size={20} />;
    }
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
            <FlaskConical size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              THE LAB
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              R&D Environment
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Hero Section */}
        <div style={{
          borderRadius: '24px', overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${GREEN}20`, marginBottom: '40px', padding: '56px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>
              Build. Learn. Apply.
            </p>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
              High-Performance<br />R&D Environment
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '480px' }}>
              Researching sovereign infrastructure and technical coherence through immersive building modules.
            </p>
          </div>

          <div style={{ flexShrink: 0, color: GREEN, opacity: 0.1, position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }}>
            <Cpu size={240} />
          </div>

          {activeBroadcast && (
            <div style={{
              position: 'absolute', bottom: '24px', right: '24px', width: '280px',
              background: 'rgba(10,16,24,0.9)', backdropFilter: 'blur(20px)',
              border: `1px solid ${GREEN}40`, borderRadius: '20px', padding: '20px',
              boxShadow: `0 12px 32px -8px rgba(0,0,0,0.5), 0 0 16px ${GREEN}15`, zIndex: 5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', animation: 'pulse-live 1.5s infinite' }} />
                <span style={{ fontSize: '9px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live on PanX TV</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'white', marginBottom: '16px', lineHeight: 1.4 }}>{activeBroadcast.title}</h4>
              <button 
                onClick={() => navigate(`/tv?view=${activeBroadcast.roomId}`)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: GREEN, color: 'white',
                  fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Play size={14} fill="currentColor" /> Join Now
              </button>
            </div>
          )}
        </div>

        {/* Categories Section */}
        {isLoading ? (
          <div style={{ padding: '100px 0', textAlign: 'center' }}>
            <Spin />
            <p style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 800 }}>Initializing Core Modules...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
            {categories.map((cat, index) => (
              <div key={cat.id || index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ color: GREEN }}>{getIcon(cat.icon)}</div>
                      <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{cat.title}</h2>
                    </div>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{cat.descriptor}</p>
                  </div>
                  <button style={{ 
                    background: 'none', border: 'none', color: GREEN, fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                    textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    View All <ChevronRight size={14} />
                  </button>
                </div>

                <div className="no-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '12px' }}>
                  {cat.packages?.map((pkg: any) => (
                    <div 
                      key={pkg.id}
                      style={{
                        width: '300px', flexShrink: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        height: '340px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
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
                    >
                      <div>
                        <span style={{ 
                          fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', 
                          background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase',
                          marginBottom: '20px', display: 'inline-block'
                        }}>
                          {pkg.level}
                        </span>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>{pkg.name}</h3>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                          Technical briefing and operational integration for {pkg.name} systems.
                        </p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                          <Rocket size={14} color={GREEN} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{pkg.duration} Mission</span>
                        </div>
                        <button style={{
                          width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${GREEN}30`,
                          background: 'transparent', color: GREEN, cursor: 'pointer',
                          fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                          Enroll Module <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-live { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.2); } }
      `}</style>
    </div>
  );
};

export default LabPage;
