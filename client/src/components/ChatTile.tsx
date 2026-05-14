import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ChatTileProps {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  onClick?: () => void;
  color?: string;
  active?: boolean;
}

const ChatTile: React.FC<ChatTileProps> = ({ icon, name, tagline, onClick, color, active }) => {
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-5 p-5 mb-3 cursor-pointer transition-all border border-transparent hover:bg-bg-secondary hover:border-border-subtle rounded-2xl ${active ? 'bg-bg-secondary border-border-subtle' : ''}`}
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg transition-transform group-hover:scale-105"
        style={{ 
          backgroundColor: color || 'var(--bg-primary)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-accent-primary transition-colors">
          {name}
        </h3>
        <p className="text-xs text-text-tertiary mt-1 font-medium truncate">
          {tagline}
        </p>
      </div>

      <div className={`opacity-0 group-hover:opacity-40 transition-opacity ${active ? 'opacity-40' : ''}`}>
        <ChevronRight size={18} className="text-white" />
      </div>
    </div>
  );
};

export default ChatTile;
