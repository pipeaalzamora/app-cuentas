import React from 'react';
import Modal from './Modal';
import Boton from './Boton';
import './ConfirmacionEliminar.css';

export interface ConfirmacionEliminarProps {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  titulo?: string;
  mensaje?: string;
  elemento?: string;
  cargando?: boolean;
  tipo?: 'eliminar' | 'advertencia' | 'peligro';
}

const ConfirmacionEliminar: React.FC<ConfirmacionEliminarProps> = ({
  abierto,
  onCerrar,
  onConfirmar,
  titulo,
  mensaje,
  elemento,
  cargando = false,
  tipo = 'eliminar'
}) => {
  const obtenerConfiguracion = () => {
    switch (tipo) {
      case 'advertencia':
        return {
          titulo: titulo || 'Confirmar acción',
          icono: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          colorIcono: 'var(--color-advertencia)',
          etiquetaConfirmar: 'Continuar',
          claseBoton: 'secondary'
        };
      case 'peligro':
        return {
          titulo: titulo || 'Acción peligrosa',
          icono: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ),
          colorIcono: 'var(--color-error)',
          etiquetaConfirmar: 'Confirmar',
          claseBoton: 'primary'
        };
      default: // eliminar
        return {
          titulo: titulo || 'Confirmar eliminación',
          icono: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          ),
          colorIcono: 'var(--color-error)',
          etiquetaConfirmar: 'Eliminar',
          claseBoton: 'primary'
        };
    }
  };

  const config = obtenerConfiguracion();

  const mensajeFinal = mensaje || 
    (elemento 
      ? `¿Estás seguro de que deseas ${tipo === 'eliminar' ? 'eliminar' : 'continuar con'} "${elemento}"?`
      : `¿Estás seguro de que deseas ${tipo === 'eliminar' ? 'eliminar este elemento' : 'continuar'}?`
    );

  const manejarConfirmar = () => {
    if (!cargando) {
      onConfirmar();
    }
  };

  const manejarCancelar = () => {
    if (!cargando) {
      onCerrar();
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={manejarCancelar}
      tamaño="sm"
      cerrarAlClickearFondo={!cargando}
      mostrarBotonCerrar={false}
    >
      <Modal.Body>
        <div className={`confirmacion-eliminar confirmacion-eliminar--${tipo}`}>
          <div 
            className="confirmacion-eliminar__icono"
            style={{ color: config.colorIcono }}
          >
            {config.icono}
          </div>
          
          <div className="confirmacion-eliminar__contenido">
            <h3 className="confirmacion-eliminar__titulo">
              {config.titulo}
            </h3>
            
            <p className="confirmacion-eliminar__mensaje">
              {mensajeFinal}
            </p>
            
            {elemento && (
              <div className="confirmacion-eliminar__elemento">
                <strong>{elemento}</strong>
              </div>
            )}
            
            {tipo === 'eliminar' && (
              <p className="confirmacion-eliminar__advertencia">
                Esta acción no se puede deshacer.
              </p>
            )}
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Boton
          variante="outline"
          onClick={manejarCancelar}
          disabled={cargando}
        >
          Cancelar
        </Boton>
        
        <Boton
          variante={config.claseBoton as 'primary' | 'secondary'}
          onClick={manejarConfirmar}
          cargando={cargando}
          className={`confirmacion-eliminar__boton-confirmar confirmacion-eliminar__boton-confirmar--${tipo}`}
        >
          {config.etiquetaConfirmar}
        </Boton>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmacionEliminar;