import React from 'react';

const GREEN = '#10B981';

interface UnifiedHeaderProps {
  title: string;
  subTitle?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  subTitle,
  icon,
  extra
}) => {
  return (
    <div className="unified-header" style={{
      padding: '24px 32px',
      background: 'rgba(10, 16, 24, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {icon && (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `${GREEN}18`,
            border: `1px solid ${GREEN}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: GREEN
          }}>
            {icon}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
            {title}
          </h1>
          {subTitle && (
            <p style={{ fontSize: '10px', fontWeight: 700, color: GREEN, letterSpacing: '0.15em', opacity: 0.8, margin: '4px 0 0 0' }}>
              {subTitle}
            </p>
          )}
        </div>
      </div>
      {extra && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{extra}</div>}
    </div>
  );
};

export default UnifiedHeader;
