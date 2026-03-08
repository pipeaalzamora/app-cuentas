import React from 'react';
import type { NavegacionItem } from './BottomNavigation';
import './Sidebar.css';

interface SidebarProps {
  items: NavegacionItem[];
  onItemClick: (itemId: string) => void;
  className?: string;
  colapsado?: boolean;
  onToggleColapse?: () => void;
}

const IconoLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

const IconoChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconoChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  onItemClick,
  className = '',
  colapsado = false,
  onToggleColapse
}) => {
  return (
    <aside className={`sidebar ${colapsado ? 'colapsado' : ''} ${className}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icono">
            <IconoLogo />
          </div>
          <span className="sidebar-logo-texto">Gestor Cuentas</span>
        </div>

        {onToggleColapse && (
          <button
            className="sidebar-toggle"
            onClick={onToggleColapse}
            aria-label={colapsado ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {colapsado ? <IconoChevronRight /> : <IconoChevronLeft />}
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar-menu-link ${item.activo ? 'activo' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onItemClick(item.id);
                }}
                title={item.label}
              >
                <span className="sidebar-menu-icono">
                  {item.icono}
                </span>
                <span className="sidebar-menu-label">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
