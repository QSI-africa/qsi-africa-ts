import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  ConfigProvider,
  Spin,
  Typography,
  Grid,
  Modal,
  Form,
  Input,
  message,
  Radio,
} from "antd";




const GREEN = '#10B981';


import {
  ArrowLeft,
  Users,
  Lightbulb,
  MapPin,
  TrendingUp,
  Handshake,
  ArrowRight,
  Building2, 
  Wifi, 
  Droplets, 
  Wind,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
  X
} from "lucide-react";
import { FaTwitter, FaLinkedin } from "react-icons/fa6";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DetailMetadataGrid from '../components/DetailMetadataGrid';
import EngagementModal from '../components/EngagementModal';

const { useBreakpoint } = Grid;

const SmartCityDemoDetail: React.FC = () => {
  const { id } = useParams();
  const [demo, setDemo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [engagementModalVisible, setEngagementModalVisible] = useState<boolean>(false);
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const infrastructureMetrics = useMemo(() => {
    return (demo?.metrics && Array.isArray(demo.metrics)) ? demo.metrics : [];
  }, [demo?.metrics]);

  const fetchDemoDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/demos/${id}`);
      setDemo(response.data);
    } catch (err: any) {
      setError("Could not load demonstrator details.");
    } finally {
      setLoading(false);
    }
  }, [id]);


  useEffect(() => {
    if (id) fetchDemoDetail();
  }, [fetchDemoDetail, id]);

  const styles = useMemo(() => ({
    markdown: {
      h3: (props: any) => <h3 style={{ fontSize: screens.md ? '24px' : '20px', fontWeight: 900, color: 'white', marginTop: '48px', marginBottom: '20px', letterSpacing: '-0.02em', textTransform: 'uppercase' }} {...props} />,
      h4: (props: any) => <h4 style={{ fontSize: screens.md ? '18px' : '16px', fontWeight: 800, color: GREEN, marginTop: '32px', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }} {...props} />,
      p: (props: any) => <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }} {...props} />,
      li: (props: any) => <li style={{ fontSize: '15px', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }} {...props} />,

      strong: (props: any) => <strong className="font-black text-white" {...props} />,
      blockquote: (props: any) => (
        <blockquote className="border-l-4 border-accent-primary bg-white/5 p-12 my-16 italic text-white rounded-[40px] shadow-2xl backdrop-blur-md" {...props} />
      ),
    }
  }), []);

  if (loading) return <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-screen"><Spin size="large" /></div>;
  if (error || !demo) return <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary min-h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-tight">{error || "Demonstrator Not Found"}</h2><button className="qsi-button primary px-8 py-3" onClick={() => navigate("/demos")}>Back to Demos</button></div>;

  return (
    <>
      <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      <div style={{
        padding: '24px 32px',
        background: 'rgba(10,16,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <button onClick={() => navigate('/demos')} className="qsi-btn qsi-btn-secondary" style={{ padding: '8px 16px', borderRadius: '10px' }}>
          <ArrowLeft size={16} /> Exit
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GREEN, boxShadow: `0 0 8px ${GREEN}`, animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Demonstrator Analysis
          </span>
        </div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Cinematic Hero */}
        <div style={{
          borderRadius: '24px', overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${GREEN}20`, marginBottom: '32px', padding: '48px 40px'
        }}>
          {demo.image && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${demo.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, pointerEvents: 'none', mixBlendMode: 'luminosity' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div className="flex items-center gap-4 mb-6">
              <span className="qsi-tag qsi-tag-primary" style={{ padding: '3px 10px', borderRadius: '8px' }}>
                {demo.status || "ACTIVE"}
              </span>
              <div className="h-[1px] w-12 bg-white/20" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">MISSION STATUS: NOMINAL</span>
            </div>

            <h2 style={{ fontSize: screens.md ? '32px' : '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '24px', maxWidth: '600px' }}>
              {demo.title}
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
              {demo.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Zone</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{demo.city}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
                  <Zap size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Layer</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Technical</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>System</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Sovereign Infrastructure</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Infrastructure Metrics Section - Data Driven */}
        {infrastructureMetrics.length > 0 && (
          <div style={{ marginBottom: '64px' }}>
            <DetailMetadataGrid title="Infrastructure Sync Parameters" metrics={infrastructureMetrics} />
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginBottom: '64px' }}>
          <div className="md:col-span-2 space-y-12 reveal-up" style={{ animationDelay: '0.2s' }}>
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={styles.markdown}>
                {demo.expandedView || demo.shortDescription}
              </ReactMarkdown>
            </article>

            {/* Visual Callout */}
            <div className="mt-24 p-1 rounded-[40px] bg-gradient-to-br from-accent-primary/20 via-transparent to-white/5 reveal-up" style={{ animationDelay: '0.3s' }}>
              <div className="p-12" style={{ backgroundColor: 'rgba(24, 36, 30, 0.6)', backdropFilter: 'blur(24px)', borderRadius: '38px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="text-xl md:text-2xl font-black text-white mb-6 uppercase tracking-tighter">Operational Blueprint</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-10 font-medium">
                  This demonstrator represents a high-fidelity realization of our technological coherence framework. It is currently operating under supervised autonomy within the specified deployment zone.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Scalable Architecture', 'Biometric Security', 'Autonomous Governance'].map(feat => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 reveal-up" style={{ animationDelay: '0.4s' }}>
            {/* Mission Control Panel */}
            <div style={{
              borderRadius: '32px', 
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(10,16,24,0.4)', 
              backdropFilter: 'blur(20px)',
              position: 'sticky', 
              top: '120px',
              overflow: 'hidden'
            }}>
              <div className="p-10 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                  <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.4em] block">Status: Online</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-none">Mission Control</h3>
                <p className="text-white/40 text-xs leading-relaxed mb-0 font-bold uppercase tracking-wide">
                  Establish physical infrastructure sync within the QSI ecosystem.
                </p>
              </div>
              
              <div className="p-10 space-y-8">
                <button 
                  className="qsi-btn qsi-btn-primary group relative overflow-hidden"
                  style={{ width: '100%', height: '64px', borderRadius: '16px' }}
                  onClick={() => setEngagementModalVisible(true)}
                >
                  <span className="relative z-10 text-[11px] font-black tracking-[0.3em]">INITIATE LINK</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                
              </div>

              <div className="px-10 pb-8 flex items-center justify-end">
                <div className="flex gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <div className="w-1 h-1 rounded-full bg-accent-primary shadow-[0_0_8px_var(--accent-primary)]" />
                </div>
              </div>
            </div>

            <div style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-6">Sovereign Distribution</span>
              <div className="flex gap-4">
                {[
                  { icon: <FaTwitter size={16} />, label: 'Twitter' },
                  { icon: <FaLinkedin size={16} />, label: 'LinkedIn' },
                  { icon: <Terminal size={16} />, label: 'Terminal' }
                ].map(social => (
                  <button 
                    key={social.label} 
                    className="qsi-btn qsi-btn-secondary"
                    style={{ width: '40px', height: '40px', borderRadius: '10px', padding: 0, color: 'rgba(255,255,255,0.5)' }}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EngagementModal 
        visible={engagementModalVisible}
        onClose={() => setEngagementModalVisible(false)}
        pilotId={id || ''}
        pilotTitle={demo?.title || ''}
        category="demo"
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  </>
);
};

export default SmartCityDemoDetail;
