import React from 'react';
import { useNavigate } from "react-router-dom";
import { GridLine, GeometricCard, CornerAccent, AfroButton } from "../components/AfroBauhausComponents";
import { 
  RocketOutlined, 
  BulbOutlined, 
  CarOutlined, 
  HeartOutlined,
  CloudServerOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    { label: 'Vision Space', icon: <BulbOutlined />, path: '/chat/vision', color: 'var(--baobab-emerald)' },
    { label: 'Smart City Demos', icon: <RocketOutlined />, path: '/demos', color: 'var(--terracotta-clay)' },
    { label: 'Mobility', icon: <CarOutlined />, path: '/mobility', color: 'var(--ochre-yellow)' },
    { label: 'Healing Chatbot', icon: <HeartOutlined />, path: '/chat/healing', color: 'var(--baobab-emerald)' },
    { label: 'Smart Infrastructure', icon: <CloudServerOutlined />, path: '/chat/infrastructure', color: 'var(--savanna-moss)' },
    { label: 'Network', icon: <GlobalOutlined />, path: '/network', color: 'var(--onyx-black)' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--canvas-white)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section className="section-py pattern-mudcloth" style={{ position: 'relative', paddingTop: '160px', backgroundColor: 'var(--canvas-white)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '64px', alignItems: 'center' }}>
          <div className="reveal-up">
            <span className="eyebrow" style={{ color: 'var(--baobab-emerald)' }}>Quality Solutions International</span>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--onyx-black)' }}>
              Innovating Africa's <br/>
              <span style={{ color: 'var(--baobab-emerald)' }}>Future. Together.</span>
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--onyx-black)', marginBottom: '48px', maxWidth: '500px', fontWeight: 500 }}>
              Empowering growth through strategic consulting, capacity building, and sustainable solutions across the continent.
            </p>
            <AfroButton primary onClick={() => navigate('/services')}>
              Explore Our Impact
            </AfroButton>
          </div>

          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                width: '100%', 
                height: '650px', 
                backgroundColor: 'var(--papyrus-off-white)',
                border: '3px solid var(--onyx-black)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <img 
                src="/hero_cityscape.png" 
                alt="Modern African Cityscape" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <CornerAccent position="br" />
            </div>
            
            {/* Floating Image Accent */}
            <div 
              style={{ 
                position: 'absolute', 
                bottom: '-40px', 
                left: '-40px', 
                width: '320px', 
                height: '320px', 
                border: '4px solid var(--canvas-white)',
                boxShadow: '20px 20px 0 var(--baobab-emerald)',
                overflow: 'hidden',
                zIndex: 5
              }}
            >
              <img 
                src="/community_accent.png" 
                alt="QSI Community" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-py grid-border-t pattern-vibrant">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
            <div>
              <span className="eyebrow">Our Services</span>
              <h2 style={{ fontSize: '3.5rem', textTransform: 'uppercase' }}>What we <span style={{ color: 'var(--baobab-emerald)' }}>do</span></h2>
            </div>
            <AfroButton onClick={() => navigate('/services')}>View All Services</AfroButton>
          </div>

          {/* Desktop View: Grid Cards */}
          <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2px', backgroundColor: 'var(--onyx-black)', border: '2px solid var(--onyx-black)' }}>
            {services.map((s, i) => (
              <div 
                key={i} 
                onClick={() => navigate(s.path)}
                className="reveal-up"
                style={{ 
                  backgroundColor: 'var(--canvas-white)', 
                  padding: '48px', 
                  cursor: 'pointer', 
                  transition: 'var(--snappy)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: '32px', color: s.color, marginBottom: '24px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '12px' }}>{s.label}</h3>
                <p style={{ color: 'var(--ash-grey)', fontSize: '14px' }}>Advanced solutions aligned with coherence principles.</p>
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '20px', opacity: 0.2 }}>0{i+1}</div>
              </div>
            ))}
          </div>

          {/* Mobile View: Horizontal Scroll with Circular Icons */}
          <div className="mobile-only no-scrollbar" style={{ display: 'flex', gap: '24px', overflowX: 'auto', padding: '20px 0' }}>
            {services.map((s, i) => (
              <div 
                key={i} 
                onClick={() => navigate(s.path)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flexShrink: 0 }}
              >
                <div className="circular-option" style={{ color: s.color, fontSize: '24px' }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-accent)', textTransform: 'uppercase' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Divider */}
      <div className="container pattern-lines" style={{ height: '100px' }} />

      {/* Stats Section */}
      <section className="section-py grid-border-t pattern-lines">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {[
              { label: 'Projects Delivered', value: '500+', desc: 'Empowering growth through strategic consulting.' },
              { label: 'Lives Impacted', value: '1M+', desc: 'Providing sustainable solutions for communities.' },
              { label: 'Capital Mobilized', value: '$2B+', desc: 'Strategic investment in infrastructure.' },
              { label: 'Countries Served', value: '45', desc: 'Expanding pan-African excellence.' },
            ].map((stat, i) => (
              <GeometricCard key={i} className="reveal-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="eyebrow">{stat.label}</span>
                <h2 style={{ fontSize: '3.5rem', margin: '8px 0', color: 'var(--baobab-emerald)' }}>{stat.value}</h2>
                <p style={{ color: 'var(--ash-grey)', fontSize: '14px' }}>{stat.desc}</p>
              </GeometricCard>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="section-py pattern-dots" style={{ backgroundColor: 'var(--papyrus-off-white)', position: 'relative', borderTop: '2px solid var(--onyx-black)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span className="eyebrow">Our Methodology</span>
            <h2 style={{ fontSize: '4rem', textTransform: 'uppercase' }}>Our Approach</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2px', backgroundColor: 'var(--onyx-black)', border: '2px solid var(--onyx-black)' }}>
            {[
              { title: 'Strategic Consulting', desc: 'Envisioning growth through strategic correctly building and sustainable solutions across the continent.' },
              { title: 'Capacity Building', desc: 'Empowering growth, team capacity building, and navigating through sustainable solutions for community impact.' },
              { title: 'Sustainable Solutions', desc: 'Sustainable solutions for urban planning and infrastructure, prioritizing environmental harmony.' },
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: 'var(--canvas-white)', padding: '64px', position: 'relative' }}>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '24px', textTransform: 'uppercase' }}>{item.title}</h3>
                <p style={{ color: 'var(--onyx-black)', lineHeight: 1.8, fontSize: '16px' }}>{item.desc}</p>
                <CornerAccent position="tl" color={i % 2 === 0 ? 'var(--terracotta-clay)' : 'var(--ochre-yellow)'} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section-py grid-border-t pattern-mudcloth">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '48px', textTransform: 'uppercase' }}>
            Ready to <span style={{ color: 'var(--baobab-emerald)' }}>Transform?</span>
          </h2>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <AfroButton primary onClick={() => navigate('/contact-us')}>Get In Touch</AfroButton>
            <AfroButton onClick={() => navigate('/about-us')}>Learn More</AfroButton>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 769px) {
          .desktop-only { display: grid !important; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
