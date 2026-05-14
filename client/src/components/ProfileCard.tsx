import React from 'react';
import { Typography, Tag, Avatar, Space } from 'antd';
import { 
  ShieldCheck, 
  ArrowRight, 
  User,
  Zap,
  Activity
} from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

interface ProfileCardProps {
  id: string;
  name: string;
  role: string;
  specialization: string;
  bio: string;
  skills: string[];
  avatarUrl?: string;
  isVerified?: boolean;
  onClick: (id: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  role,
  specialization,
  bio,
  skills,
  avatarUrl,
  isVerified,
  onClick
}) => {
  return (
    <div 
      className="feed-card bg-bg-secondary border-border-subtle p-8 cursor-pointer hover:border-accent-primary/40 transition-all group"
      onClick={() => onClick(id)}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-bg-primary border border-border-subtle overflow-hidden relative z-10 group-hover:scale-105 transition-transform">
             {avatarUrl ? (
               <img src={avatarUrl} className="w-full h-full object-cover" alt={name} />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                 <User size={32} />
               </div>
             )}
          </div>
          {isVerified && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-green rounded-xl flex items-center justify-center text-white border-2 border-bg-secondary z-20 shadow-xl">
               <ShieldCheck size={16} />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-accent-primary transition-colors">
                {name}
              </h3>
              <span className="text-[10px] font-black text-success-green uppercase tracking-[0.15em]">
                {specialization || role}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-40 transition-opacity">
               <ArrowRight size={20} className="text-white" />
            </div>
          </div>
          
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-6">
            {bio || "Contributing to the pan-African infrastructure and mental transformation."}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map((skill: string) => (
              <span 
                key={skill} 
                className="text-[9px] font-black text-text-tertiary uppercase tracking-widest bg-bg-primary px-3 py-1 rounded-full border border-border-subtle group-hover:border-accent-primary/20 group-hover:text-accent-primary transition-colors"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest bg-bg-primary px-3 py-1 rounded-full border border-border-subtle">
                +{skills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative Progress Accent */}
      <div className="mt-8 h-px w-full bg-border-subtle/50 relative overflow-hidden">
         <div 
           className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isVerified ? 'bg-success-green w-full' : 'bg-accent-primary w-1/3'}`} 
         />
      </div>
    </div>
  );
};

export default ProfileCard;
