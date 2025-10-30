import React from 'react';
import { useTema } from '../contextos/TemaContext';
import './AlternadorTema.css';

const AlternadorTema: React.FC = () => {
  const { temaOscuro, alternarTema } = useTema();

  return (
    <button
      onClick={alternarTema}
      className="alternador-tema"
      aria-label={temaOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={temaOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <div className="alternador-tema__contenedor">
        <div className={`alternador-tema__icono ${temaOscuro ? 'alternador-tema__icono--activo' : ''}`}>
          🌙
        </div>
        <div className={`alternador-tema__icono ${!temaOscuro ? 'alternador-tema__icono--activo' : ''}`}>
          ☀️
        </div>
        <div className={`alternador-tema__indicador ${temaOscuro ? 'alternador-tema__indicador--oscuro' : ''}`} />
      </div>
    </button>
  );
};

export default AlternadorTema;