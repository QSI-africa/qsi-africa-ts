import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Space, App as AntApp, Spin, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Layout, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Globe,
  LayoutGrid,
  Sparkles,
  Brain,
  ChevronRight,
  Shield,
  Layers,
  Cpu,
  Bot
} from 'lucide-react';

const { Text } = Typography;
const GREEN = '#10B981';

interface Product {
  id: string;
  title: string;
  price?: string;
  image?: string;
  category: string;
  description?: string;
  isChat?: boolean;
  moduleName?: string;
}

const ServicesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { message } = AntApp.useApp();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.qsi.africa/api";
      
      const [registryRes, conceptsRes, demosRes] = await Promise.allSettled([
        axios.get(`${baseURL}/config/services`),
        axios.get(`${baseURL}/submit/concepts`),
        axios.get(`${baseURL}/submit/demos`)
      ]);

      let allProducts: Product[] = [];

      // 1. Add Registry Services (formerly hardcoded chatServices)
      if (registryRes.status === 'fulfilled' && Array.isArray(registryRes.value.data)) {
        allProducts = [...allProducts, ...registryRes.value.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description,
          isChat: item.isChat,
          moduleName: item.path,
          image: item.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
        }))];
      }

      // 2. Add Concepts
      if (conceptsRes.status === 'fulfilled' && Array.isArray(conceptsRes.value.data)) {
        allProducts = [...allProducts, ...conceptsRes.value.data.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          category: 'concepts',
          image: item.image || item.imageUrl,
          price: '$99.00',
          description: item.shortDescription || 'Innovative conceptual frameworks for future African cities and systems.'
        }))];
      }

      // 3. Add Demos
      if (demosRes.status === 'fulfilled' && Array.isArray(demosRes.value.data)) {
        allProducts = [...allProducts, ...demosRes.value.data.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          category: 'demos',
          image: item.image || item.imageUrl,
          price: '$299.00',
          description: item.shortDescription || 'Live demonstrations of smart infrastructure and technical coherence.'
        }))];
      }

      setProducts(allProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      message.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleAction = (product: Product) => {
    if (product.isChat) {
      navigate(`/chat/${product.moduleName}`);
    } else if (product.category === 'concepts') {
      navigate(`/concepts/${product.id}`);
    } else if (product.category === 'demos') {
      navigate(`/demos/${product.id}`);
    } else {
      navigate(`/${product.category}`);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'infrastructure': return <LayoutGrid size={14} />;
      case 'healing': return <Sparkles size={14} />;
      case 'vision': return <Brain size={14} />;
      case 'concepts': return <Layers size={14} />;
      case 'demos': return <Cpu size={14} />;
      default: return <Zap size={14} />;
    }
  };

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
            <Layers size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              SERVICES
            </h1>
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>
              Operational Modules
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'infrastructure', 'healing', 'vision', 'concepts', 'demos'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                transition: 'all 0.2s',
                background: activeCategory === cat ? GREEN : 'rgba(255,255,255,0.04)',
                color: activeCategory === cat ? 'white' : 'rgba(255,255,255,0.4)',
                boxShadow: activeCategory === cat ? `0 6px 16px -4px ${GREEN}60` : 'none',
              }}
            >
              {cat}
            </button>
          ))}
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
              Enterprise Solutions
            </p>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
              Operationalize<br />Pan-African Impact
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '520px' }}>
              Explore high-performance infrastructure, restoration protocols, and visionary translation modules.
            </p>
          </div>

          <div style={{ flexShrink: 0, color: GREEN, opacity: 0.1, position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }}>
            <Globe size={240} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center' }}><Spin /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredProducts.map((product) => (
              <Col key={product.id} xs={24} sm={12}>
                <div 
                  onClick={() => handleAction(product)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '24px', padding: '0', height: '100%', overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column'
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
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                    <div style={{ 
                      position: 'absolute', top: '16px', left: '16px', 
                      background: 'rgba(10,16,24,0.8)', backdropFilter: 'blur(8px)',
                      padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <span style={{ color: GREEN }}>{getCategoryIcon(product.category)}</span>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</span>
                    </div>
                    {product.isChat && (
                      <div style={{ 
                        position: 'absolute', bottom: '16px', right: '16px',
                        background: GREEN, color: 'white', padding: '4px 12px', borderRadius: '8px',
                        fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em'
                      }}>
                        AI Enabled
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>{product.title}</h3>
                      {product.price && <span style={{ fontSize: '14px', fontWeight: 900, color: GREEN }}>{product.price}</span>}
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '24px' }}>
                      {product.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={12} color="rgba(255,255,255,0.2)" />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Secured</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={12} color="rgba(255,255,255,0.2)" />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Optimized</span>
                      </div>
                      <div style={{ flex: 1 }} />
                      <button style={{ 
                        background: 'none', border: 'none', color: GREEN, fontSize: '11px', fontWeight: 800, 
                        textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' 
                      }}>
                        {product.isChat ? 'Synchronize' : 'Operationalize'} <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div style={{ padding: '100px 0', textAlign: 'center' }}>
            <Activity size={48} color="rgba(255,255,255,0.05)" style={{ marginBottom: '24px' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>No modules found in this category.</p>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ServicesPage;
