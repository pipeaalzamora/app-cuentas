import { CuentasProvider } from './contextos/CuentasContext';
import { ConfiguracionProvider } from './contextos/ConfiguracionContext';
import { TemaProvider } from './contextos/TemaContext';
import { AppRouter } from './componentes/AppRouter';
import { ErrorBoundary } from './componentes/ErrorBoundary';
import { ManejadorErrores } from './utilidades/manejoErrores';
import type { ErrorInfo } from 'react';
import './App.css';

function App() {
  const manejarErrorGlobal = (error: Error, errorInfo: ErrorInfo) => {
    ManejadorErrores.registrarError(error, {
      componentStack: errorInfo.componentStack,
      location: window.location.href
    }, 'high');
  };

  return (
    <ErrorBoundary onError={manejarErrorGlobal}>
      <TemaProvider>
        <ConfiguracionProvider>
          <CuentasProvider>
            <div className="app">
              <AppRouter />
            </div>
          </CuentasProvider>
        </ConfiguracionProvider>
      </TemaProvider>
    </ErrorBoundary>
  );
}

export default App
