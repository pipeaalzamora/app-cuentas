import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation, Sidebar, Breadcrumbs } from './navegacion';
import AlternadorTema from './AlternadorTema';
import type { NavegacionItem, BreadcrumbItem } from './navegacion';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  seccionActual: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  seccionActual,
  breadcrumbs = []
}) => {
  const navigate = useNavigate();
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  const [esMobile, setEsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const detectarMobile = () => {
      setEsMobile(window.innerWidth <= 768);
    };

    detectarMobile();
    window.addEventListener('resize', detectarMobile);
    
    return () => window.removeEventListener('resize', detectarMobile);
  }, []);

  // Manejar navegación con React Router
  const manejarNavegacion = (seccion: string) => {
    if (seccion === 'dashboard') {
      navigate('/', { replace: true });
    } else {
      navigate(`/${seccion}`, { replace: true });
    }
  };

  // Manejar click en breadcrumbs
  const manejarBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.ruta) {
      navigate(item.ruta);
    }
  };

  // Items de navegación
  const itemsNavegacion: NavegacionItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icono: '🏠',
      activo: seccionActual === 'dashboard'
    },
    {
      id: 'cuentas',
      label: 'Cuentas',
      icono: '📝',
      activo: seccionActual === 'cuentas'
    },
    {
      id: 'desglosador',
      label: 'Mi Sueldo',
      icono: '💵',
      activo: seccionActual === 'desglosador'
    },
    {
      id: 'desglosador-bebe',
      label: 'Bebé',
      icono: '👶',
      activo: seccionActual === 'desglosador-bebe'
    },
    {
      id: 'gastos',
      label: 'Gastos',
      icono: '🧮',
      activo: seccionActual === 'gastos'
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icono: '📊',
      activo: seccionActual === 'estadisticas'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icono: '📄',
      activo: seccionActual === 'reportes'
    }
  ];

  const manejarToggleSidebar = () => {
    setSidebarColapsado(!sidebarColapsado);
  };

  return (
    <div className={`layout ${sidebarColapsado ? 'sidebar-colapsado' : ''}`}>
      {/* Sidebar para desktop */}
      {!esMobile && (
        <Sidebar
          items={itemsNavegacion}
          onItemClick={manejarNavegacion}
          colapsado={sidebarColapsado}
          onToggleColapse={manejarToggleSidebar}
        />
      )}

      {/* Contenido principal */}
      <main className="layout-main">
        {/* Header con breadcrumbs y alternador de tema */}
        <div className="layout-header">
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              items={breadcrumbs}
              onItemClick={manejarBreadcrumbClick}
            />
          )}
          <div className="layout-header__acciones">
            <AlternadorTema />
          </div>
        </div>

        {/* Contenido */}
        <div className="layout-contenido">
          {children}
        </div>

        {/* Espaciado inferior para bottom navigation en móvil */}
        {esMobile && <div className="layout-bottom-spacer" />}
      </main>

      {/* Bottom Navigation para móvil */}
      {esMobile && (
        <BottomNavigation
          items={itemsNavegacion}
          onItemClick={manejarNavegacion}
        />
      )}
    </div>
  );
};

export default Layout;