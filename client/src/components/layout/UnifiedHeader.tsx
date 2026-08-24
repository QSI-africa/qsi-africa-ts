import React from 'react';
import { ArrowLeft } from 'lucide-react';

const GREEN = '#008751';

interface UnifiedHeaderProps {
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  /** On mobile, renders a back arrow button before the title */
  backAction?: () => void;
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  subTitle,
  icon,
  extra,
  backAction,
}) => {
  return (
    <div
      className="unified-header"
      style={{
        background: 'rgba(10, 16, 24, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        width: '100%',
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '10px',
        padding: '0 16px',
      }}
    >
      {/* Back button (mobile only) */}
      {backAction && (
        <button
          onClick={backAction}
          aria-label="Go back"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Optional leading icon */}
      {icon && (
        <div style={{ flexShrink: 0 }}>
          {icon}
        </div>
      )}

      {/* Title + Subtitle (grows to fill space) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: '16px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </h1>
        {subTitle && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
            {subTitle}
          </div>
        )}
      </div>

      {/* Extra / actions (always right-aligned) */}
      {extra && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {extra}
        </div>
      )}
    </div>
  );
};

export default UnifiedHeader;
