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
    <div className="no-scrollbar" style={{ width: '100%', overflowX: 'auto', padding: '20px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content', padding: '0 6%' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                border: '1px solid',
                borderColor: isActive ? 'var(--bg-secondary)' : 'rgba(2, 44, 34, 0.08)', 
                background: isActive ? 'var(--bg-secondary)' : 'white', 
                color: isActive ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', 
                padding: '12px 24px',
                borderRadius: '100px',
                outline: 'none',
                transition: 'var(--transition-smooth)',
                boxShadow: isActive ? 'var(--shadow-soft)' : 'none',
              }}
            >
              <Icon style={{ fontSize: '18px' }} />
              <span 
                style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
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
