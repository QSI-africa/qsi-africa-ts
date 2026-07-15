import React from "react";
import { 
  Users, 
  Lightbulb, 
  Cpu,
  Globe,
  Zap,
  Shield,
  ArrowRight
} from "lucide-react";
import UnifiedHeader from "../components/layout/UnifiedHeader";

const AboutUs: React.FC = () => {
  const coreAreas = [
    {
      icon: <Users size={28} />,
      title: "Consciousness & Culture",
      description: "Uniting human consciousness and culture into one continuous system of progress and resilience."
    },
    {
      icon: <Lightbulb size={28} />,
      title: "Creation & Innovation",
      description: "Translating cosmic alignment into tangible innovation, and intention into infrastructure."
    },
    {
      icon: <Cpu size={28} />,
      title: "Coherence Framework",
      description: "A living intelligence framework designed specifically for the African Renaissance."
    },
  ];

  const foundations = [
    { title: "Quantum Entanglement", desc: "Communities, economies, and individuals are interconnected. A shift in one field ripples across the entire sovereign system." },
    { title: "Resonance", desc: "When Africans align in vision, gratitude, and coherence, their collective vibration multiplies exponentially." },
    { title: "Least Action", desc: "Nature achieves transformation through the path of least resistance. We design strategies that move with flow." },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-bg-primary no-scrollbar">
      <UnifiedHeader
        title="About Us"
        subTitle="Vision & Philosophy"
      />

      {/* Core Areas */}
      <section className="p-8 lg:p-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {coreAreas.map((area, i) => (
            <div key={i} className="feed-card reveal-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-2xl bg-accent-primary-soft border border-accent-primary-soft flex items-center justify-center text-accent-primary mb-8">
                {area.icon}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">{area.title}</h3>
              <p className="text-text-secondary leading-relaxed">{area.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Foundations */}
      <section className="p-12 lg:p-20 bg-bg-secondary border-y border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="eyebrow">Technical Foundations</span>
              <h2 className="text-4xl font-bold text-white">First Principles</h2>
            </div>
            <div className="hidden lg:block text-text-tertiary">
               <Zap size={48} className="opacity-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {foundations.map((f, i) => (
              <div key={i} className="reveal-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <h4 className="text-lg font-bold text-accent-primary mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
                  {f.title}
                </h4>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission CTA */}
      <section className="p-12 lg:p-20 text-center">
        <div className="max-w-3xl mx-auto">
          <Shield size={48} className="mx-auto mb-8 text-accent-primary opacity-30" />
          <h2 className="text-4xl font-extrabold text-white mb-8">"When coherence leads, everything aligns."</h2>
          <p className="text-xl text-text-secondary mb-12">
            A return to the natural order of creation, where every idea, structure, and life form vibrates in harmony with its true sovereign purpose.
          </p>
          <button className="qsi-button primary px-10 py-4 text-lg flex items-center gap-2 mx-auto">
             Join the Renaissance <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
