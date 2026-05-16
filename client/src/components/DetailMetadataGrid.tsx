import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

interface DetailMetadataGridProps {
  metrics: Metric[];
  title?: string;
}

const DetailMetadataGrid: React.FC<DetailMetadataGridProps> = ({ metrics, title }) => {
  return (
    <div className="space-y-6">
      {title && (
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block">
          {title}
        </span>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="group p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all duration-500"
          >
            <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-500`} style={{ color: metric.color }}>
              <metric.icon size={20} />
            </div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">
              {metric.label}
            </span>
            <span className="text-lg font-black text-white uppercase tracking-tight">
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailMetadataGrid;
