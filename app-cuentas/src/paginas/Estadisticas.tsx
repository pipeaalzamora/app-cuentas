import React from 'react';
import { PanelEstadisticas } from '../componentes';

export const Estadisticas: React.FC = () => {
  return (
    <div className="pagina-container">
      <div className="pagina-header">
        <h1>Estadísticas y Análisis</h1>
      </div>
      <PanelEstadisticas />
    </div>
  );
};

export default Estadisticas;