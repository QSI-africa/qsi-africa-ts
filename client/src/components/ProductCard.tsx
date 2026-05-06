import React from 'react';

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
      className="tap-active"
      style={{
        backgroundColor: 'var(--canvas-white)',
        border: '1px solid var(--onyx-black)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'var(--snappy)',
        position: 'relative'
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: 'var(--papyrus-off-white)', borderBottom: '2px solid var(--onyx-black)' }}>
        <img 
          src={image || `https://via.placeholder.com/600x450/0B6138/ffffff?text=${encodeURIComponent(title)}`} 
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div 
          style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0', 
            padding: '4px 12px', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: 'var(--canvas-white)',
            backgroundColor: 'var(--onyx-black)',
            fontFamily: 'var(--font-accent)'
          }}
        >
          {category}
        </div>
      </div>
      
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            lineHeight: '1.2', 
            textTransform: 'uppercase',
            color: 'var(--onyx-black)',
            fontFamily: 'var(--font-heading)'
          }}>
            {title}
          </h3>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <span style={{ 
               fontSize: '11px', 
               fontWeight: 'bold', 
               color: 'var(--baobab-emerald)', 
               textTransform: 'uppercase',
               letterSpacing: '0.1em',
               fontFamily: 'var(--font-accent)'
             }}>
                View Details →
             </span>
             {price && (
               <span style={{ 
                 fontSize: '14px', 
                 fontWeight: 'bold', 
                 color: 'var(--onyx-black)',
                 fontFamily: 'var(--font-accent)'
               }}>
                 {price}
               </span>
             )}
          </div>
        </div>
      </div>
      
      {/* Removed card-accent and global hover styles that were causing glitches */}
    </div>
  );
};

export default ProductCard;
