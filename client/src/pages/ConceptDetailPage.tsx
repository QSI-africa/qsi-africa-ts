import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
  Grid,
  Input,
} from "antd";
const GREEN = '#008751';


import {
  ArrowLeft,
  Calendar,
  Layers,
  Globe,
  Activity, 
  Link,
  Heart,
  Flame,
  Hammer
} from "lucide-react";
import { FaTwitter, FaLinkedin } from "react-icons/fa6";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DetailMetadataGrid from '../components/DetailMetadataGrid';
import EngagementModal from '../components/EngagementModal';
import UnifiedHeader from '../components/layout/UnifiedHeader';

const { TextArea } = Input;

const ConceptDetailPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const { id } = useParams();
  const [pilot, setPilot] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [engagementModalVisible, setEngagementModalVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  const strategicMetrics = useMemo(() => {
    return (pilot?.metrics && Array.isArray(pilot.metrics)) ? pilot.metrics : [];
  }, [pilot?.metrics]);

  const fetchPilotDetail = useCallback(async () => {
    if (id && ["placebo", "heritage_flame", "futurecraft"].includes(id)) {
      setPilot({ key: id });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      const response = await axios.get(`${baseURL}/submit/concepts/${id}`);
      setPilot(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not load concept details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchPilotDetail();
  }, [fetchPilotDetail, id]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const markdownComponents = {
    h3: (props: any) => <h3 style={{ fontSize: screens.md ? '24px' : '20px', fontWeight: 900, color: 'white', marginTop: '48px', marginBottom: '20px', letterSpacing: '-0.02em', textTransform: 'uppercase' }} {...props} />,
    h4: (props: any) => <h4 style={{ fontSize: screens.md ? '18px' : '16px', fontWeight: 800, color: GREEN, marginTop: '32px', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }} {...props} />,
    p: (props: any) => <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }} {...props} />,
    li: (props: any) => <li style={{ fontSize: '15px', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }} {...props} />,
    strong: (props: any) => <strong className="font-black text-white" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-accent-primary bg-white/5 p-12 my-16 italic text-white rounded-[40px] shadow-2xl backdrop-blur-md" {...props} />
    ),
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-bg-primary min-h-screen"><Spin size="large" /></div>;
  if (error || !pilot) return <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary min-h-screen p-8 text-center"><h2 className="text-2xl font-bold text-red-500 mb-6 uppercase tracking-tight">{error || "Concept Not Found"}</h2><button className="qsi-button primary px-8 py-3" onClick={() => navigate(-1)}>Back</button></div>;

  const comingSoonKeys = ["placebo", "heritage_flame", "futurecraft"];
  const isComingSoon = pilot && comingSoonKeys.includes(pilot.key);

  if (isComingSoon) {
    const config = {
      placebo: {
        color: '#10B981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        icon: <Heart size={64} style={{ color: '#10B981', filter: 'drop-shadow(0 0 25px rgba(16, 185, 129, 0.4))' }} />,
        title: 'Placebo',
        tagline: 'STRATEGIC CLOTHING & WEARABLE ALIGNMENT',
        description: 'A revolutionary Pan-African lifestyle brand transforming clothing into energetic alignment. Merging material physics, geometry, and indigenous textiles to build a wearable ecosystem that restores harmony, dignity, and consciousness.',
        status: 'Calibration: 84% Sync',
        percent: 84
      },
      heritage_flame: {
        color: '#F59E0B',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        icon: <Flame size={64} style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 25px rgba(245, 158, 11, 0.4))' }} />,
        title: 'Heritage Flame',
        tagline: 'CULTURAL ENERGY & NUTRITIONAL GRIDS',
        description: 'Powering local sovereignty through regenerative biomass energy grids and conscious culinary spaces. Reclaiming traditional recipe systems, localized clean cooking fuels, and circular agricultural models across the continent.',
        status: 'Calibration: 71% Sync',
        percent: 71
      },
      futurecraft: {
        color: '#D97706',
        glowColor: 'rgba(217, 119, 6, 0.4)',
        icon: <Hammer size={64} style={{ color: '#D97706', filter: 'drop-shadow(0 0 25px rgba(217, 119, 6, 0.4))' }} />,
        title: 'FutureCraft Cooperative',
        tagline: 'DIGITAL FABRI-ARTISAN MANUFACTURING',
        description: 'Empowering African craftspeople with modern digital tooling, CNC routing, and modular wood/bamboo design. Shifting production from extraction to creation and linking skilled makers to international design markets.',
        status: 'Calibration: 62% Sync',
        percent: 62
      }
    }[pilot.key as 'placebo' | 'heritage_flame' | 'futurecraft'] || {
      color: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      icon: <Activity size={64} />,
      title: pilot.title,
      tagline: 'ECOSYSTEM INTEGRATION',
      description: pilot.shortDescription,
      status: 'Calibration Pending',
      percent: 50
    };

    return (
      <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
        <UnifiedHeader
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color, boxShadow: `0 0 8px ${config.color}`, animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Pending Node Integration
              </span>
            </div>
          }
          extra={
            <button onClick={() => navigate(-1)} className="qsi-btn qsi-btn-secondary" style={{ padding: '8px 16px', borderRadius: '10px' }}>
              <ArrowLeft size={16} /> Exit
            </button>
          }
        />

        <div style={{ 
          maxWidth: '650px', 
          margin: '40px auto', 
          padding: '48px 24px', 
          textAlign: 'center', 
          position: 'relative'
        }}>
          {/* Background Ambient Aura */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: config.glowColor,
            filter: 'blur(100px)',
            opacity: 0.15,
            pointerEvents: 'none'
          }} />

          {/* Centralized Premium Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
            padding: '8px 16px',
            borderRadius: '40px',
            marginBottom: '40px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.color, display: 'inline-block' }} />
            <span style={{ fontSize: '9px', fontWeight: 900, color: 'white', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8 }}>
              Calibration Phase Active
            </span>
          </div>

          {/* Glowing Icon Wrapper */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '40px',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1.5px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px auto',
            transform: 'rotate(-5deg)'
          }}>
            {config.icon}
          </div>

          <p style={{ 
            fontSize: '10px', 
            fontWeight: 900, 
            color: config.color, 
            textTransform: 'uppercase', 
            letterSpacing: '0.3em', 
            marginBottom: '16px' 
          }}>
            {config.tagline}
          </p>

          <h1 style={{ 
            fontSize: '44px', 
            fontWeight: 950, 
            color: 'white', 
            letterSpacing: '-0.03em', 
            textTransform: 'uppercase',
            lineHeight: 1.1,
            marginBottom: '24px' 
          }}>
            {config.title}
          </h1>

          <p style={{ 
            fontSize: '15px', 
            lineHeight: '1.8', 
            color: 'rgba(255, 255, 255, 0.5)', 
            marginBottom: '40px',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {config.description}
          </p>

          {/* Calibration Progress Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1.5px solid rgba(255, 255, 255, 0.06)',
            padding: '24px',
            borderRadius: '24px',
            marginBottom: '48px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                System Calibration
              </span>
              <span style={{ fontSize: '11px', fontWeight: 900, color: config.color }}>
                {config.status}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${config.percent}%`,
                height: '100%',
                background: config.color,
                boxShadow: `0 0 10px ${config.color}`,
                borderRadius: '3px',
                transition: 'width 1s ease-in-out'
              }} />
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              className="qsi-btn qsi-btn-primary"
              style={{ 
                height: '64px', 
                borderRadius: '18px', 
                fontSize: '11px', 
                fontWeight: 900, 
                letterSpacing: '0.3em',
                background: 'white',
                color: 'black'
              }}
              onClick={() => setEngagementModalVisible(true)}
            >
              INITIATE INTEGRATION
            </button>
            <button 
              className="qsi-btn qsi-btn-secondary"
              style={{ 
                height: '64px', 
                borderRadius: '18px', 
                fontSize: '11px', 
                fontWeight: 900, 
                letterSpacing: '0.3em',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
              onClick={() => navigate(-1)}
            >
              RETURN TO ECOSYSTEM
            </button>
          </div>
        </div>

        <EngagementModal 
          visible={engagementModalVisible}
          onClose={() => setEngagementModalVisible(false)}
          pilotId={id || ''}
          pilotTitle={pilot?.title || ''}
          category="concept"
        />

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div style={{ height: '100%', overflowY: 'auto', background: 'transparent' }} className="no-scrollbar">
      <UnifiedHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Concept Analysis
            </span>
          </div>
        }
        extra={
          <button onClick={() => navigate(-1)} className="qsi-btn qsi-btn-secondary" style={{ padding: '8px 16px', borderRadius: '10px' }}>
            <ArrowLeft size={16} /> Exit
          </button>
        }
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Immersive Strategic Hero */}
        <div style={{
          borderRadius: '24px', overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${GREEN}10 0%, rgba(255,255,255,0.01) 100%)`,
          border: `1px solid ${GREEN}20`, marginBottom: '32px', padding: '48px 40px'
        }}>
          {pilot.image && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${pilot.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, pointerEvents: 'none', mixBlendMode: 'luminosity' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div className="flex items-center gap-4 mb-6">
              <span className="qsi-tag qsi-tag-primary" style={{ padding: '3px 10px', borderRadius: '8px' }}>
                {pilot.status || "STRATEGIC"}
              </span>
            </div>

            <h2 style={{ fontSize: screens.md ? '32px' : '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '24px', maxWidth: '600px' }}>
              {pilot.title}
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Publication</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{formatDate(pilot.createdAt)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
                  <Globe size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Scope</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Pan-African</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN }}>
                  <Layers size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Framework</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{pilot.category || "General"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Metrics Section - Data Driven */}
        {strategicMetrics.length > 0 && (
          <div style={{ marginBottom: '64px' }}>
            <DetailMetadataGrid title="Strategic Architecture Parameters" metrics={strategicMetrics} />
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginBottom: '64px' }}>
          <div className="md:col-span-2 space-y-12">
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {pilot.expandedView || pilot.shortDescription}
              </ReactMarkdown>
            </article>
          </div>

          <div className="space-y-6">
            {/* Action Button */}
            <div style={{
              borderRadius: '32px', 
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(10,16,24,0.4)', 
              backdropFilter: 'blur(20px)',
              position: 'sticky', 
              top: '120px',
              overflow: 'hidden',
              padding: '24px'
            }}>
              <button 
                className="qsi-btn qsi-btn-primary"
                style={{ width: '100%', height: '64px', borderRadius: '16px' }}
                onClick={() => setEngagementModalVisible(true)}
              >
                <span className="relative z-10 text-[11px] font-black tracking-[0.3em]">CONTACT US</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <EngagementModal 
        visible={engagementModalVisible}
        onClose={() => setEngagementModalVisible(false)}
        pilotId={id || ''}
        pilotTitle={pilot?.title || ''}
        category="concept"
      />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  </>
);
};

export default ConceptDetailPage;
