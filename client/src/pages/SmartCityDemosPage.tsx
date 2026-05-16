import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Typography, Spin, App as AntApp, Grid } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  Activity,
  MapPin,
  Map
} from "lucide-react";


const GREEN = '#10B981';

const SmartCityDemosPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();

  const fetchFrameworks = useCallback(async (cat: string = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/demos`, {
        params: { category: cat }
      });
      if (Array.isArray(response.data)) {
        setFrameworks(response.data);
      } else {
        setError("Received invalid data format.");
      }
    } catch (err) {
      setError("Could not load city demonstrators.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFrameworks(activeCategory);
  }, [fetchFrameworks, activeCategory]);



  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      <div style={{
        padding: screens.md ? '24px 32px' : '16px 20px',
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', 
        flexDirection: screens.md ? 'row' : 'column',
        alignItems: screens.md ? 'center' : 'flex-start', 
        justifyContent: 'space-between',
        gap: screens.md ? '0' : '20px',
        position: 'sticky', top: 0, zIndex: 20
      }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white tracking-tight leading-none uppercase">SMART CITY</h1>
              <p className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em] mt-1 opacity-80">Physical Demonstrators</p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '8px',
            width: screens.md ? 'auto' : '100%',
            overflowX: screens.md ? 'visible' : 'auto',
            paddingBottom: screens.md ? '0' : '4px',
          }} className="no-scrollbar">
            {['all', 'infrastructure', 'energy', 'mobility'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ whiteSpace: 'nowrap' }}
                className={`qsi-btn ${activeCategory === cat ? 'qsi-btn-primary' : 'qsi-btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          {/* Immersive Hero Section */}
          <div style={{
            borderRadius: '24px', overflow: 'hidden', position: 'relative',
            background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${GREEN}20`, marginBottom: '32px', 
            padding: screens.md ? '48px 40px' : '40px 24px',
            display: 'flex', 
            flexDirection: screens.md ? 'row' : 'column',
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '24px',
            textAlign: screens.md ? 'left' : 'center'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div className="relative z-10 max-w-xl">
              <p className="text-[10px] font-black text-accent-primary uppercase tracking-[0.3em] mb-6">Physical Infrastructure</p>
              <h2 className={`${screens.md ? 'text-5xl lg:text-7xl' : 'text-2xl'} font-black text-white tracking-tighter leading-tight mb-8 uppercase`}>
                African Urbanism<br />Lived, Not Imagined
              </h2>
              <p className="text-base lg:text-lg text-text-secondary leading-relaxed font-medium">
                Tangible physical demonstrators where real-world prototypes of technological coherence are deployed.
              </p>
            </div>

            <div className="relative z-10 opacity-10 text-accent-primary hidden lg:block">
              <Map size={280} />
            </div>
          </div>

          {loading ? (
            <div className="py-32 text-center"><Spin size="large" /></div>
          ) : error ? (
            <div className="p-12 border border-red-500/20 bg-red-500/5 rounded-[32px] text-center">
              <span className="text-red-500 font-black uppercase tracking-[0.2em]">{error}</span>
            </div>
          ) : (
            <Row gutter={[32, 32]}>
              {frameworks.map((demo) => (
                <Col key={demo.id} xs={24} lg={12}>
                  <div 
                    onClick={() => navigate(`/demos/${demo.id}`)}
                    style={{
                      padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.25s', position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${GREEN}30`;
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN, marginBottom: '16px'
                    }}>
                      <Building2 size={20} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '6px', letterSpacing: '-0.02em' }}>{demo.title}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{demo.shortDescription}</p>
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: GREEN, opacity: 0.05 }}>
                      <MapPin size={40} />
                    </div>
                  </div>
                </Col>
              ))}
              {frameworks.length === 0 && (
                <Col span={24}>
                  <div className="py-32 text-center opacity-20">
                    <Activity size={64} className="mx-auto mb-8" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No demonstrators found</p>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </div>


      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
);
};

export default SmartCityDemosPage;
