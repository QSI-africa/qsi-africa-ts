import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Grid } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const screens = Grid.useBreakpoint();

  const fetchConcepts = useCallback(async (cat: string = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/concepts`, {
        params: { category: cat }
      });
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
        icon={<Lightbulb size={20} />}
        extra={
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            width: screens.md ? 'auto' : '100%',
            overflowX: screens.md ? 'visible' : 'auto',
            paddingBottom: screens.md ? '0' : '4px',
          }} className="no-scrollbar">
            {['all', 'infrastructure','renaissance'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ whiteSpace: 'nowrap' }}
                className={`qsi-btn ${activeCategory === cat ? 'qsi-btn-primary' : 'qsi-btn-secondary'}`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        }
      />

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
