import React from 'react';
import './BottomNavigation.css';

export interface NavegacionItem {
  id: string;
  label: string;
  icono: string;
  activo?: boolean;
}

interface BottomNavigationProps {
  items: NavegacionItem[];
  onItemClick: (itemId: string) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  onItemClick,
  className = ''
}) => {
  return (
    <nav className={`bottom-navigation ${className}`}>
      <div className="bottom-navigation-container">
        {items.map((item) => (
          <button
            key={item.id}
            className={`bottom-navigation-item ${item.activo ? 'activo' : ''}`}
            onClick={() => onItemClick(item.id)}
            aria-label={item.label}
          >
            <span className="bottom-navigation-icono">
              {item.icono}
            </span>
            <span className="bottom-navigation-label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;