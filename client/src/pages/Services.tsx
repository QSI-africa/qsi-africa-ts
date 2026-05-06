import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Space, App as AntApp } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CategoryScroll from "../components/CategoryScroll";
import ProductCard from "../components/ProductCard";
import SkeletonListing from "../components/SkeletonListing";
import { useAuth } from "../context/AuthContext";
import { CornerAccent } from "../components/AfroBauhausComponents";

const { Title, Text, Paragraph } = Typography;

interface Product {
  id: string;
  title: string;
  price?: string;
  image?: string;
  category: string;
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
      
      const [conceptsRes, demosRes] = await Promise.allSettled([
        axios.get(`${baseURL}/submit/concepts`),
        axios.get(`${baseURL}/submit/demos`)
      ]);

      let allProducts: Product[] = [];

      if (conceptsRes.status === 'fulfilled' && Array.isArray(conceptsRes.value.data)) {
        allProducts = [...allProducts, ...conceptsRes.value.data.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          category: 'concepts',
          image: item.image || item.imageUrl,
          price: '$99.00'
        }))];
      }

      if (demosRes.status === 'fulfilled' && Array.isArray(demosRes.value.data)) {
        allProducts = [...allProducts, ...demosRes.value.data.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          category: 'demos',
          image: item.image || item.imageUrl,
          price: '$299.00'
        }))];
      }

      const mockProducts: Product[] = [
        { id: 'm1', title: 'Smart Mobility Hub', category: 'mobility', price: '$1,500.00' },
        { id: 'h1', title: 'Coherence Therapy Session', category: 'healing', price: '$120.00' },
        { id: 'i1', title: 'Solar Infrastructure Kit', category: 'infrastructure', price: '$4,200.00' },
        { id: 'v1', title: 'Vision Strategy Workshop', category: 'vision', price: '$500.00' }
      ];

      setProducts([...allProducts, ...mockProducts]);
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

  const handleProductClick = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      if (product.category === 'concepts') navigate(`/concepts/${id}`);
      else if (product.category === 'demos') navigate(`/demos/${id}`);
      else navigate(`/${product.category}`);
    }
  };

  const handleQuickAction = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleProductClick(id);
  };

  return (
    <div style={{ backgroundColor: 'var(--canvas-white)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Page Header */}
      <div className="pattern-dots" style={{ backgroundColor: 'var(--papyrus-off-white)', borderBottom: '2px solid var(--onyx-black)', padding: '120px 0 80px 0' }}>
        <div className="container">
          <span className="eyebrow">QSI Ecosystem</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '-0.01em' }}>
            Our <span style={{ color: 'var(--baobab-emerald)' }}>Solutions</span>
          </h1>
          <p style={{ maxWidth: '600px', fontSize: '18px', color: 'var(--onyx-black)', fontWeight: 500 }}>
            Explore our curated selection of smart infrastructure, healing therapies, and innovative concepts designed for the pan-african future.
          </p>
        </div>
      </div>

      <div style={{ position: 'sticky', top: '80px', zIndex: 100, backgroundColor: 'var(--canvas-white)', borderBottom: '2px solid var(--onyx-black)' }}>
        <CategoryScroll 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </div>

      <div className="container" style={{ marginTop: '64px', paddingBottom: '120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
          <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.25rem' }}>
            {activeCategory === 'all' ? 'All Solutions' : `${activeCategory} focus`}
          </h3>
          <Text style={{ fontFamily: 'var(--font-accent)', color: 'var(--ash-grey)', fontWeight: 'bold' }}>{filteredProducts.length} Results</Text>
        </div>

        {loading ? (
          <SkeletonListing />
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '2px', 
            backgroundColor: 'var(--onyx-black)',
            border: '2px solid var(--onyx-black)'
          }}>
            {filteredProducts.map((product) => (
              <div key={product.id} style={{ backgroundColor: 'var(--canvas-white)' }}>
                <ProductCard 
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                  onClick={handleProductClick}
                  onQuickAction={handleQuickAction}
                />
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '120px 0', border: '2px dashed var(--ash-grey)' }}>
            <Paragraph style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No results found.</Paragraph>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
