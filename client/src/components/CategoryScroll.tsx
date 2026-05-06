import React from 'react';
import { 
  AppstoreOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  HeartOutlined,
  RocketOutlined,
  BuildOutlined
} from '@ant-design/icons';

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: AppstoreOutlined },
  { id: 'infrastructure', label: 'Infrastructure', icon: BuildOutlined },
  { id: 'vision', label: 'Vision Space', icon: EyeOutlined },
  { id: 'mobility', label: 'Mobility', icon: ThunderboltOutlined },
  { id: 'concepts', label: 'Concepts', icon: BulbOutlined },
  { id: 'healing', label: 'Healing', icon: HeartOutlined },
  { id: 'demos', label: 'Smart City', icon: RocketOutlined },
];

interface CategoryScrollProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryScroll: React.FC<CategoryScrollProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="no-scrollbar" style={{ width: '100%', overflowX: 'auto', padding: '24px 0' }}>
      <div style={{ display: 'flex', gap: '32px', minWidth: 'max-content', padding: '0 5%' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '12px', 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer', 
                padding: 0,
                outline: 'none'
              }}
            >
              <div 
                className={`circular-option ${isActive ? 'active' : ''}`}
                style={{
                   fontSize: '24px',
                   borderWidth: isActive ? '3px' : '2px'
                }}
              >
                <Icon />
              </div>
              <span 
                style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: isActive ? 'var(--baobab-emerald)' : 'var(--onyx-black)',
                  fontFamily: 'var(--font-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryScroll;
