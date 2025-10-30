import React from 'react';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  ruta?: string;
  activo?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
  separador?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onItemClick,
  separador = '/',
  className = ''
}) => {
  const manejarClick = (item: BreadcrumbItem, event: React.MouseEvent) => {
    if (item.activo) {
      event.preventDefault();
      return;
    }
    
    if (onItemClick) {
      event.preventDefault();
      onItemClick(item);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Navegación de ruta">
      <ol className="breadcrumbs-lista">
        {items.map((item, index) => (
          <li key={item.id} className="breadcrumbs-item">
            {item.activo ? (
              <span className="breadcrumbs-link activo" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                className="breadcrumbs-link"
                onClick={(e) => manejarClick(item, e)}
                type="button"
              >
                {item.label}
              </button>
            )}
            
            {index < items.length - 1 && (
              <span className="breadcrumbs-separador" aria-hidden="true">
                {separador}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;