import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Lightbulb,
  Zap,
  Activity
} from "lucide-react";
import UnifiedHeader from '../components/layout/UnifiedHeader';

const GREEN = '#10B981';

const QsiConceptsPage: React.FC = () => {
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const navigate = useNavigate();

  const fetchConcepts = useCallback(async (cat: string = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/submit/concepts`, {
        params: { category: cat }
      });
      console.log("concepts", response.data)
      if (Array.isArray(response.data)) {
        setPilots(response.data);
      } else {
        setError("Received invalid data format.");
      }
    } catch (err: any) {
      setError("Could not load digital concepts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConcepts(activeCategory);
  }, [fetchConcepts, activeCategory]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      <UnifiedHeader
        title="Concepts"
        subTitle="Digital Concepts & Frameworks"
      />

      {/* Filter Strip */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '4px', overflowX: 'auto' }} className="no-scrollbar">
        <div style={{ display: 'flex', gap: '8px', paddingLeft: '24px', paddingRight: '16px', paddingBottom: '4px', paddingTop: '4px' }} className="no-scrollbar">
          {['all', 'infrastructure', 'renaissance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pill ${activeCategory === cat ? 'active' : ''}`}
              style={{
                whiteSpace: 'nowrap',
                textTransform: 'uppercase', fontWeight: 800, fontSize: '11px', letterSpacing: '0.05em',
                padding: '8px 16px', borderRadius: '20px', flexShrink: 0,
                border: activeCategory === cat ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                background: activeCategory === cat ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                color: activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

          {loading ? (
            <div className="py-32 text-center"><Spin size="large" /></div>
          ) : error ? (
            <div className="p-12 border border-red-500/20 bg-red-500/5 rounded-[32px] text-center">
              <span className="text-red-500 font-black tracking-tight">{error}</span>
            </div>
          ) : (
            <Row gutter={[32, 32]}>
              {pilots.map((pilot) => (
                <Col key={pilot.id} xs={24} lg={12}>
                  <div 
                    onClick={() => navigate(`/concepts/${pilot.id}`)}
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
                      <Lightbulb size={20} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '6px', letterSpacing: '-0.02em' }}>{pilot.title}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{pilot.shortDescription}</p>
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', color: GREEN, opacity: 0.05 }}>
                      <Zap size={40} />
                    </div>
                  </div>
                </Col>
              ))}
              {pilots.length === 0 && (
                <Col span={24}>
                  <div className="py-32 text-center opacity-20">
                    <Activity size={64} className="mx-auto mb-8" />
                    <p className="text-xs font-black tracking-widest">No concepts found</p>
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

export default QsiConceptsPage;
