import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Typography, Spin, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Lightbulb,
  ArrowRight,
  Zap,
  Globe,
  Layers,
  Activity
} from "lucide-react";

const { Title, Paragraph, Text } = Typography;

const QsiConceptsPage: React.FC = () => {
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConcepts = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
        const response = await axios.get(`${baseURL}/submit/concepts`);
        if (Array.isArray(response.data)) {
          setPilots(response.data);
        } else {
          setError("Received invalid data format.");
        }
      } catch (err) {
        setError("Could not load digital concepts.");
      } finally {
        setLoading(false);
      }
    };
    fetchConcepts();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      {/* Hero Section */}
      <header className="p-12 lg:p-20 bg-bg-secondary border-b border-border-subtle relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <span className="eyebrow">Culture Engineered</span>
          <h1 className="text-5xl lg:text-8xl font-black text-white mt-4 mb-8 tracking-tighter uppercase leading-none">
            Digital <br/><span className="text-gold">Concepts</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">
            Brand-anchored innovation concepts merging culture, technology, and consciousness. Each concept operates as a collaborative technical framework.
          </p>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none">
           <Layers size={600} className="text-accent-gold" />
        </div>
      </header>

      <section className="max-w-6xl mx-auto w-full p-8 lg:p-12">
        {loading ? (
          <div className="py-24 text-center">
            <Spin />
            <p className="text-xs text-text-tertiary uppercase tracking-widest font-black mt-4 animate-pulse">Retrieving Vision Models...</p>
          </div>
        ) : error ? (
          <div className="py-12 px-8 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
            <Text type="danger" className="font-bold uppercase tracking-widest">{error}</Text>
          </div>
        ) : (
          <Row gutter={[32, 32]}>
            {pilots.length > 0 ? (
              pilots.map((pilot) => (
                <Col key={pilot.id} xs={24} sm={12} md={8}>
                  <div 
                    className="feed-card bg-bg-secondary border-border-subtle p-8 h-full flex flex-col justify-between cursor-pointer hover:border-accent-gold/40 transition-all group"
                    onClick={() => navigate(`/concepts/${pilot.id}`)}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-bg-primary flex items-center justify-center text-accent-gold border border-border-subtle group-hover:border-accent-gold/30 transition-colors">
                          <Lightbulb size={20} />
                        </div>
                        <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Innovation Model</span>
                      </div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 group-hover:text-accent-gold transition-colors">
                        {pilot.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-8 line-clamp-4">
                        {pilot.shortDescription}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-border-subtle/50">
                      <span className="text-[10px] font-black text-accent-gold uppercase tracking-widest">
                        Explore Concept
                      </span>
                      <ArrowRight size={18} className="text-accent-gold transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div className="py-24 text-center">
                   <Activity size={48} className="mx-auto text-text-tertiary opacity-10 mb-6" />
                   <p className="text-text-tertiary uppercase font-black tracking-widest">No concepts registered in this cycle.</p>
                </div>
              </Col>
            )}
          </Row>
        )}
      </section>
    </div>
  );
};

export default QsiConceptsPage;
