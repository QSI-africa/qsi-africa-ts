import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';

interface ProductCardProps {
  id: string;
  title: string;
  price?: string;
  image?: string;
  category: string;
  onClick: (id: string) => void;
  onQuickAction: (e: React.MouseEvent, id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  id, 
  title, 
  price, 
  image, 
  category, 
  onClick, 
}) => {
  return (
    <div 
      onClick={() => onClick(id)}
      className="qsi-card reveal-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(2, 44, 34, 0.05)',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
        <img 
          src={image || `https://via.placeholder.com/600x400/064E3B/ffffff?text=${encodeURIComponent(title)}`} 
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.2, 0, 0, 1)' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div 
          style={{ 
            position: 'absolute', 
            top: '16px', 
            left: '16px', 
            padding: '6px 14px', 
            fontSize: '11px', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            color: 'white',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '100px',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          {category}
        </div>
      </div>
      
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.4rem', 
            lineHeight: '1.3', 
            color: 'var(--text-primary)',
            fontWeight: 700
          }}>
            {title}
          </h3>
          <p style={{ marginTop: '12px', color: 'var(--slate-grey)', fontSize: '15px', lineHeight: 1.6 }}>
            Coherent strategy and execution for sustainable pan-African infrastructure.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-green)', fontWeight: 600, fontSize: '14px' }}>
            Learn More <ArrowRightOutlined style={{ fontSize: '12px' }} />
          </div>
          {price && (
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              color: 'var(--text-primary)',
            }}>
              {price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
