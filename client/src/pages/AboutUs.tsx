import React from "react";
import { 
  TeamOutlined, 
  BulbOutlined, 
  ToolOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { GridLine, GeometricCard, CornerAccent } from "../components/AfroBauhausComponents";

const AboutUs: React.FC = () => {
  const coreAreas = [
    {
      icon: <TeamOutlined />,
      title: "Consciousness & Culture",
      description: "Uniting human consciousness and culture into one continuous system of progress."
    },
    {
      icon: <BulbOutlined />,
      title: "Creation & Innovation",
      description: "Translating alignment into innovation, intention into infrastructure."
    },
    {
      icon: <ToolOutlined />,
      title: "Coherence Framework",
      description: "A living intelligence framework for the African Renaissance."
    },
  ];

  const foundations = [
    { title: "Quantum Entanglement", desc: "Communities, economies, and individuals are interconnected. A shift in one field ripples across the entire system." },
    { title: "Resonance", desc: "When Africans align in vision, gratitude, and coherence, their collective vibration multiplies." },
    { title: "Least Action", desc: "Nature achieves transformation through the path of least resistance. Designing strategies that move with flow." },
  ];

  return (
    <div style={{ backgroundColor: 'var(--canvas-white)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero Section */}
      <section className="section-py pattern-mudcloth" style={{ borderBottom: '2px solid var(--onyx-black)', backgroundColor: 'var(--papyrus-off-white)' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <span className="eyebrow">Quantum Spiritual Intelligence</span>
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', textTransform: 'uppercase', marginBottom: '32px', letterSpacing: '-0.02em' }}>
            A living intelligence <br/>
            <span style={{ color: 'var(--baobab-emerald)' }}>for the African Renaissance</span>
          </h1>
          <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '20px', lineHeight: 1.6, color: 'var(--onyx-black)', fontWeight: 500 }}>
            QSI is a practical intelligence framework designed to help Africans think, build, and organize systems more coherently. It brings together human awareness, cultural knowledge, technology, and design into one integrated way of creating progress.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-py">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2px', backgroundColor: 'var(--onyx-black)', border: '2px solid var(--onyx-black)' }}>
            {coreAreas.map((area, i) => (
              <div key={i} style={{ backgroundColor: 'var(--canvas-white)', padding: '64px', position: 'relative' }}>
                <div style={{ fontSize: '32px', color: 'var(--baobab-emerald)', marginBottom: '24px' }}>{area.icon}</div>
                <h3 style={{ fontSize: '1.75rem', textTransform: 'uppercase', marginBottom: '16px' }}>{area.title}</h3>
                <p style={{ color: 'var(--onyx-black)', fontSize: '16px', lineHeight: 1.7 }}>{area.description}</p>
                <CornerAccent position="tr" color={i === 1 ? 'var(--terracotta-clay)' : 'var(--baobab-emerald)'} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Divider */}
      <div className="container pattern-lines" style={{ height: '80px' }} />

      {/* Foundations Section */}
      <section className="section-py pattern-dots" style={{ backgroundColor: 'var(--papyrus-off-white)', borderTop: '2px solid var(--onyx-black)' }}>
        <div className="container">
          <div style={{ marginBottom: '80px', textAlign: 'center' }}>
            <span className="eyebrow">The Science</span>
            <h2 style={{ fontSize: '3.5rem', textTransform: 'uppercase' }}>Scientific Foundations</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {foundations.map((f, i) => (
              <GeometricCard key={i}>
                <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '16px', color: 'var(--baobab-emerald)' }}>{f.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--onyx-black)', lineHeight: 1.6 }}>{f.desc}</p>
              </GeometricCard>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-py">
        <div className="container">
          <div style={{ border: '3px solid var(--onyx-black)', padding: '80px', textAlign: 'center', position: 'relative', backgroundColor: 'var(--canvas-white)' }}>
            <CornerAccent position="tl" size={60} />
            <CornerAccent position="br" size={60} color="var(--terracotta-clay)" />
            <h2 style={{ fontSize: '3.5rem', textTransform: 'uppercase', marginBottom: '32px' }}>"When coherence leads, everything aligns."</h2>
            <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '18px', lineHeight: 1.8 }}>
              A return to the natural order of creation, where every idea, structure, and life form vibrates in harmony with purpose.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
