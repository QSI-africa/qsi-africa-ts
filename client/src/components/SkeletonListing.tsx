import React from 'react';

const SkeletonListing: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '24px 16px' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="loading-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ aspectRatio: '1/1', backgroundColor: 'var(--bg-soft-grey)', borderRadius: '24px', width: '100%' }} />
          <div style={{ height: '16px', backgroundColor: 'var(--bg-soft-grey)', borderRadius: '4px', width: '75%' }} />
          <div style={{ height: '16px', backgroundColor: 'var(--bg-soft-grey)', borderRadius: '4px', width: '50%' }} />
          <div style={{ height: '40px', backgroundColor: 'var(--bg-soft-grey)', borderRadius: '12px', width: '100%', marginTop: '8px' }} />
        </div>
      ))}
    </div>
  );
};

export default SkeletonListing;
