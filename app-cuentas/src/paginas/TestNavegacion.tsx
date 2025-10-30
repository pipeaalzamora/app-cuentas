import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TestNavegacion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navegarA = (ruta: string) => {
    console.log(`Navegando a: ${ruta}`);
    navigate(ruta);
  };

  return (
    <div className="pagina-container">
      <div className="pagina-header">
        <h1>Test de Navegación</h1>
        <p>Ruta actual: {location.pathname}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => navegarA('/')}>
          Ir a Dashboard
        </button>
        <button onClick={() => navegarA('/cuentas')}>
          Ir a Cuentas
        </button>
        <button onClick={() => navegarA('/estadisticas')}>
          Ir a Estadísticas
        </button>
        <button onClick={() => navegarA('/reportes')}>
          Ir a Reportes
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Información de Debug:</h3>
        <pre>{JSON.stringify({ pathname: location.pathname, search: location.search }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestNavegacion;