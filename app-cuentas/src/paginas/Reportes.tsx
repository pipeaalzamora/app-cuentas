import React from 'react';
import { GeneradorReportes } from '../componentes';

export const Reportes: React.FC = () => {
  return (
    <div className="pagina-container">
      <div className="pagina-header">
        <h1>Generación de Reportes</h1>
      </div>
      <GeneradorReportes />
    </div>
  );
};

export default Reportes;