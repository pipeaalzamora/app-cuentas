import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="pagina-container pagina-404">
      <div className="pagina-404-contenido">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>La página que buscas no existe o ha sido movida.</p>
        <Link to="/" className="boton boton-primario">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;