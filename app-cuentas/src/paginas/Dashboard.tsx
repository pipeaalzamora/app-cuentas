import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelPrincipal } from '../componentes';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const manejarNavegacion = (seccion: string) => {
    navigate(`/${seccion}`);
  };

  return (
    <div className="pagina-container">
      <div className="pagina-header">
        <h1>Dashboard Principal</h1>
      </div>
      <PanelPrincipal onNavegar={manejarNavegacion} />
    </div>
  );
};

export default Dashboard;