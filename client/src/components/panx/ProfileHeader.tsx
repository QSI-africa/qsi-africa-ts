import React, { useState } from 'react';
import { ShieldCheck, UserCheck, UserPlus, Edit3, ArrowLeft, X } from 'lucide-react';
import { Modal, Tag } from 'antd';

const GREEN = '#008751';

const getServerUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  try {
    const origin = new URL(baseURL).origin;
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  } catch {
    return path;
  }
};

const getInitials = (name: string) => {
  if (!name) return "P";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export interface ProfileTabItem {
  key: string;
  label: string;
  count?: number;
}

export interface ProfileHeaderProps {
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
  onBackClick?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: ProfileTabItem[];
  extraActions?: React.ReactNode;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  role,
  bio,
  avatarUrl,
  bannerUrl,
  isVerified,
  followersCount,
  followingCount,
  isFollowing,
  onFollowToggle,
  isOwnProfile,
  onEditClick,
  onBackClick,
  activeTab,
  onTabChange,
  tabs,
  extraActions
}) => {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  return (
    <div className="w-full flex flex-col bg-bg-primary">
      {/* 1. Cover Banner */}
      <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
        {bannerUrl ? (
          <img
            src={getServerUrl(bannerUrl)}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, rgba(0, 135, 81, 0.35) 0%, rgba(10, 16, 24, 0.95) 100%)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(0, 135, 81, 0.25) 0%, transparent 60%)'
            }} />
          </div>
        )}

        {/* Gradient transition overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '90px',
          background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)'
        }} />

        {onBackClick && (
          <button
            onClick={onBackClick}
            style={{
              position: 'absolute', top: '16px', left: '16px',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white', zIndex: 20
            }}
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* 2. Identity Header */}
      <div style={{ padding: '0 24px', marginTop: '-48px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          {/* Avatar Icon */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsAvatarOpen(true)}
              aria-label={`Expand ${name}'s profile image`}
              style={{
              width: '96px', height: '96px', borderRadius: '50%',
              overflow: 'hidden', border: '4px solid var(--bg-primary)',
              background: 'rgba(0, 135, 81, 0.2)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-in', padding: 0
            }}>
              {avatarUrl ? (
                <img src={getServerUrl(avatarUrl)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '28px', fontWeight: 900, color: GREEN }}>
                  {getInitials(name)}
                </span>
              )}
            </button>
            {isVerified && (
              <div 
                style={{
                  position: 'absolute', bottom: '2px', right: '2px',
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: GREEN, color: 'black', border: '3px solid var(--bg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                }}
              >
                <ShieldCheck size={14} strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            {extraActions}
            {isOwnProfile && onEditClick && (
              <button
                onClick={onEditClick}
                style={{
                  padding: '8px 18px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontWeight: 800, fontSize: '11px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
            {!isOwnProfile && onFollowToggle && (
              <button
                onClick={onFollowToggle}
                style={{
                  padding: '8px 20px', borderRadius: '12px',
                  background: isFollowing ? 'rgba(255,255,255,0.06)' : GREEN,
                  border: isFollowing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  color: isFollowing ? 'rgba(255,255,255,0.6)' : 'black',
                  fontWeight: 900, fontSize: '11px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Title & Bio */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              {name}
            </h1>
            {role && (
              <Tag style={{ background: 'rgba(0, 135, 81, 0.15)', color: GREEN, border: `1px solid ${GREEN}`, borderRadius: '10px', padding: '2px 10px', fontSize: '10px', fontWeight: 800 }}>
                {role}
              </Tag>
            )}
          </div>
          {bio && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13.5px', lineHeight: 1.6, margin: 0, maxWidth: '650px' }}>
              {bio}
            </p>
          )}
        </div>

        {/* Stats */}
        {(followersCount !== undefined || followingCount !== undefined) && (
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
            {followersCount !== undefined && (
              <div><strong style={{ color: 'white' }}>{followersCount}</strong> Followers</div>
            )}
            {followingCount !== undefined && (
              <div><strong style={{ color: 'white' }}>{followingCount}</strong> Following</div>
            )}
          </div>
        )}

        {/* Tabs Sub-Navigation */}
        {tabs && tabs.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginBottom: '24px', overflowX: 'auto' }} className="no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange && onTabChange(tab.key)}
                  style={{
                    padding: '8px 18px', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                    background: isActive ? GREEN : 'rgba(255,255,255,0.03)',
                    color: isActive ? 'black' : 'rgba(255,255,255,0.6)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <Modal
        open={isAvatarOpen}
        onCancel={() => setIsAvatarOpen(false)}
        footer={null}
        closeIcon={<X size={18} />}
        centered
        width="min(92vw, 640px)"
        styles={{
          content: { background: '#0a1018', border: '1px solid rgba(255,255,255,0.12)', padding: '16px' },
          body: { display: 'flex', justifyContent: 'center' },
          mask: { background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }
        }}
      >
        {avatarUrl ? (
          <img src={getServerUrl(avatarUrl)} alt={name} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px' }} />
        ) : (
          <div style={{ width: 'min(70vw, 420px)', aspectRatio: '1', borderRadius: '50%', background: 'rgba(0,135,81,0.2)', display: 'grid', placeItems: 'center', color: GREEN, fontSize: '120px', fontWeight: 900 }}>
            {getInitials(name)}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileHeader;
