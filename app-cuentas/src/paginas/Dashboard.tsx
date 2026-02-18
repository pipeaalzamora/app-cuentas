import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardModerno } from '../componentes/DashboardModerno';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const manejarNavegacion = (seccion: string) => {
    navigate(`/${seccion}`);
  };

  return <DashboardModerno onNavegar={manejarNavegacion} />;
};

export default Dashboard;