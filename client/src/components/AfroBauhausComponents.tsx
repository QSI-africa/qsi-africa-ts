import React from 'react';

export const GridLine: React.FC<{ 
  vertical?: boolean; 
  className?: string;
  color?: 'onyx' | 'emerald';
}> = ({ vertical, className = '', color = 'onyx' }) => {
  const colorClass = color === 'emerald' ? 'grid-border-emerald' : '';
  return (
    <div 
      className={`${vertical ? 'grid-border-l h-full' : 'grid-border-t w-full'} ${colorClass} ${className}`}
    />
  );
};

export const GeometricCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  borderColor?: 'onyx' | 'emerald';
}> = ({ children, className = '', borderColor = 'onyx' }) => {
  const colorClass = borderColor === 'emerald' ? 'grid-border-emerald' : '';
  return (
    <div className={`geometric-card ${colorClass} ${className}`}>
      {children}
    </div>
  );
};

export const CornerAccent: React.FC<{ 
  position: 'tl' | 'tr' | 'bl' | 'br'; 
  color?: string;
}> = ({ position, color = 'var(--terracotta-clay)' }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: color,
    zIndex: 10,
  };

  if (position === 'tl') { style.top = '-6px'; style.left = '-6px'; }
  if (position === 'tr') { style.top = '-6px'; style.right = '-6px'; }
  if (position === 'bl') { style.bottom = '-6px'; style.left = '-6px'; }
  if (position === 'br') { style.bottom = '-6px'; style.right = '-6px'; }

  return <div style={style} />;
};

export const AfroButton: React.FC<{
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
  className?: string;
  href?: string;
}> = ({ children, primary, onClick, className = '', href }) => {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag 
      href={href}
      onClick={onClick}
      className={`afro-button ${primary ? 'primary' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
};
