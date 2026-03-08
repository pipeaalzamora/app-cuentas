import React from 'react';
import './BottomNavigation.css';

export interface NavegacionItem {
  id: string;
  label: string;
  icono: string;
  activo?: boolean;
}

// SVG icons por id de sección
const SVG_ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  cuentas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h6M9 16h4"/>
    </svg>
  ),
  desglosador: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
      <path d="M9.5 9.5a3.5 3.5 0 015 0"/>
    </svg>
  ),
  estadisticas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M7 16l4-4 4 4 4-6"/>
    </svg>
  ),
  reportes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <path d="M14 2v6h6M8 13h8M8 17h5"/>
    </svg>
  ),
};

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
    <nav className={`bottom-navigation ${className}`} aria-label="Navegación principal">
      <div className="bottom-navigation-container">
        {items.map((item) => (
          <button
            key={item.id}
            className={`bottom-navigation-item ${item.activo ? 'activo' : ''}`}
            onClick={() => onItemClick(item.id)}
            aria-label={item.label}
            aria-current={item.activo ? 'page' : undefined}
          >
            <span className="bottom-navigation-icono" aria-hidden="true">
              {SVG_ICONS[item.id] ?? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              )}
            </span>
            <span className="bottom-navigation-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
