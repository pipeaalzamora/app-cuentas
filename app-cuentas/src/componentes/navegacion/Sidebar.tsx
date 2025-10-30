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
          <span className="sidebar-logo-icono">💰</span>
          {!colapsado && (
            <span className="sidebar-logo-texto">
              Gestor Cuentas
            </span>
          )}
        </div>
        
        {onToggleColapse && (
          <button
            className="sidebar-toggle"
            onClick={onToggleColapse}
            aria-label={colapsado ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {colapsado ? '→' : '←'}
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {items.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              <button
                className={`sidebar-menu-link ${item.activo ? 'activo' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onItemClick(item.id);
                }}
                title={colapsado ? item.label : undefined}
              >
                <span className="sidebar-menu-icono">
                  {item.icono}
                </span>
                {!colapsado && (
                  <span className="sidebar-menu-label">
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!colapsado && (
          <div className="sidebar-footer-info">
            <p className="sidebar-version">v1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;