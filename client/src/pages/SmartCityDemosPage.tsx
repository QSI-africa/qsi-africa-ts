import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Tag, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  ArrowRight,
  Zap,
  Globe,
  Activity,
  Box,
  TrendingUp,
  Building2,
  ChevronRight,
  Wind,
  Layers,
  Map
} from "lucide-react";

const GREEN = '#10B981';

const SmartCityDemosPage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFrameworks = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
        const response = await axios.get(`${baseURL}/submit/demos`);
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
    };
    fetchFrameworks();
  }, []);

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
            <Building2 size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              SMART CITY
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              Physical Demonstrators
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
              Physical Infrastructure
            </p>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
              African Urbanism<br />Lived, Not Imagined
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '480px' }}>
              Tangible physical demonstrators where real-world prototypes of technological coherence are deployed.
            </p>
          </div>

          <div style={{ flexShrink: 0, color: GREEN, opacity: 0.1, position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }}>
            <Map size={240} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center' }}><Spin /></div>
        ) : error ? (
          <div style={{ padding: '32px', borderRadius: '24px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
            <p style={{ color: '#EF4444', fontWeight: 700, margin: 0 }}>{error}</p>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {frameworks.length > 0 ? frameworks.map((demo) => (
              <Col key={demo.id} xs={24} sm={12}>
                <div 
                  onClick={() => navigate(`/demos/${demo.id}`)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '24px', padding: '32px', height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN
                      }}>
                        <Layers size={20} />
                      </div>
                      <span style={{ 
                        fontSize: '9px', fontWeight: 900, background: demo.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', 
                        color: demo.status === 'ACTIVE' ? GREEN : 'rgba(255,255,255,0.4)', 
                        padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.1em'
                      }}>
                        {demo.status || "PROPOSED"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>{demo.title}</h3>
                    
                    {demo.city && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                        <MapPin size={12} color={GREEN} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{demo.city}</span>
                      </div>
                    )}

                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '32px' }}>
                      {demo.shortDescription}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em' }}>View Prototype</span>
                    <ArrowRight size={18} color={GREEN} />
                  </div>
                </div>
              </Col>
            )) : (
              <Col span={24}>
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                  <Activity size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: '24px' }} />
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>No physical demonstrators registered.</p>
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
