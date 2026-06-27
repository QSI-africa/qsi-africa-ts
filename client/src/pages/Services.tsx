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

import UnifiedHeader from '../components/layout/UnifiedHeader';

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
      message.error(error?.response?.data?.error || error?.response?.data?.message || "Failed to load products.");
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
      <UnifiedHeader
        title="Services"
        subTitle="Operational Modules"
        icon={<Layers size={20} />}
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'infrastructure', 'healing', 'vision', 'concepts', 'demos'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 800, textTransform: 'none', letterSpacing: '0.1em',
                  transition: 'all 0.2s',
                  background: activeCategory === cat ? GREEN : 'rgba(255,255,255,0.04)',
                  color: activeCategory === cat ? 'white' : 'rgba(255,255,255,0.4)',
                  boxShadow: activeCategory === cat ? `0 6px 16px -4px ${GREEN}60` : 'none',
                }}
              >
                {{
                  all: 'All',
                  infrastructure: 'Infrastructure',
                  healing: 'Healing',
                  vision: 'Vision',
                  concepts: 'Concepts',
                  demos: 'Demos'
                }[cat] || cat}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

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
                      <span style={{ fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'none', letterSpacing: '0.05em' }}>{product.category}</span>
                    </div>
                    {product.isChat && (
                      <div style={{ 
                        position: 'absolute', bottom: '16px', right: '16px',
                        background: GREEN, color: 'white', padding: '4px 12px', borderRadius: '8px',
                        fontSize: '9px', fontWeight: 900, textTransform: 'none', letterSpacing: '0.1em'
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
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>Secured</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={12} color="rgba(255,255,255,0.2)" />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>Optimized</span>
                      </div>
                      <div style={{ flex: 1 }} />
                      <button style={{ 
                        background: 'none', border: 'none', color: GREEN, fontSize: '11px', fontWeight: 800, 
                        textTransform: 'none', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' 
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
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>No modules found in this category.</p>
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
