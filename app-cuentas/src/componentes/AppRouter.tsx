import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import { ErrorBoundary } from './ErrorBoundary';
import type { BreadcrumbItem } from './navegacion';

// Importaciones directas para evitar problemas de lazy loading
import Dashboard from '../paginas/Dashboard';
import Cuentas from '../paginas/Cuentas';
import Estadisticas from '../paginas/Estadisticas';
import Reportes from '../paginas/Reportes';
import Desglosador from '../paginas/Desglosador';
import DesglosadorBebe from '../paginas/DesglosadorBebe';
import Gastos from '../paginas/Gastos';
import NotFound from '../paginas/NotFound';
import TestNavegacion from '../paginas/TestNavegacion';



// Componente interno que usa useLocation
const AppContent: React.FC = () => {
  const location = useLocation();

  // Generar breadcrumbs basados en la ruta actual
  const generarBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        activo: path === '/',
        ruta: '/'
      }
    ];

    const rutaLabels: Record<string, string> = {
      '/cuentas': 'Gestión de Cuentas',
      '/estadisticas': 'Estadísticas y Análisis',
      '/reportes': 'Generación de Reportes',
      '/desglosador': 'Desglosador de Sueldo',
      '/desglosador-bebe': 'Gastos del Bebé',
      '/gastos': 'Calculadora de Gastos'
    };

    if (path !== '/') {
      const label = rutaLabels[path] || 'Página';
      breadcrumbs.push({
        id: path.slice(1),
        label,
        activo: true,
        ruta: path
      });
    }

    // Agregar breadcrumb para formularios
    if (path === '/cuentas' && searchParams.get('accion')) {
      const accion = searchParams.get('accion');
      breadcrumbs.push({
        id: 'formulario',
        label: accion === 'editar' ? 'Editar Cuenta' : 'Nueva Cuenta',
        activo: true
      });
    }

    return breadcrumbs;
  };

  const obtenerSeccionActual = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/cuentas')) return 'cuentas';
    if (path.startsWith('/estadisticas')) return 'estadisticas';
    if (path.startsWith('/reportes')) return 'reportes';
    if (path === '/desglosador-bebe') return 'desglosador-bebe';
    if (path.startsWith('/desglosador')) return 'desglosador';
    if (path.startsWith('/gastos')) return 'gastos';
    return 'dashboard';
  };

  return (
    <Layout
      seccionActual={obtenerSeccionActual()}
      breadcrumbs={generarBreadcrumbs()}
    >
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/desglosador" element={<Desglosador />} />
          <Route path="/desglosador-bebe" element={<DesglosadorBebe />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/test" element={<TestNavegacion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default AppRouter;