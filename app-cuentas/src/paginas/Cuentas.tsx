import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ListaCuentas } from '../componentes';
import FormularioCuentaAvanzado from '../componentes/FormularioCuentaAvanzado';
import type { CuentaServicio } from '../tipos';
import '../estilos/botones-modernos.css';
import './Cuentas.css';

export const Cuentas: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cuentaAEditar, setCuentaAEditar] = useState<CuentaServicio | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Efecto para sincronizar el estado con los parámetros de URL
  useEffect(() => {
    const accion = searchParams.get('accion');
    setMostrarFormulario(accion === 'nuevo' || accion === 'editar');
    
    // Si no hay acción, limpiar la cuenta a editar
    if (!accion) {
      setCuentaAEditar(null);
    }
  }, [searchParams]);

  const manejarEditarCuenta = (cuenta: CuentaServicio) => {
    setCuentaAEditar(cuenta);
    setMostrarFormulario(true);
    navigate('/cuentas?accion=editar');
  };

  const manejarCerrarFormulario = () => {
    setCuentaAEditar(null);
    setMostrarFormulario(false);
    navigate('/cuentas');
  };

  const manejarAgregarCuenta = () => {
    setCuentaAEditar(null);
    setMostrarFormulario(true);
    navigate('/cuentas?accion=nuevo');
  };

  if (mostrarFormulario) {
    const accion = searchParams.get('accion');
    return (
      <div className="pagina-container" key={`formulario-${accion}-${cuentaAEditar?.id || 'nuevo'}`}>
        <div className="pagina-header">
          <h1>{cuentaAEditar ? 'Editar Cuenta' : 'Nueva Cuenta'}</h1>
        </div>
        <FormularioCuentaAvanzado
          key={`form-${accion}-${cuentaAEditar?.id || 'nuevo'}`}
          cuentaInicial={cuentaAEditar || undefined}
          enGuardar={manejarCerrarFormulario}
          enCancelar={manejarCerrarFormulario}

        />
      </div>
    );
  }

  return (
    <div className="pagina-container">
      <div className="pagina-header">
        <h1>Gestión de Cuentas</h1>
        <button 
          className="btn-moderno btn-moderno--agregar"
          onClick={manejarAgregarCuenta}
        >
          <span className="btn-moderno__icono">+</span>
          <span>Agregar Cuenta</span>
        </button>
      </div>
      <ListaCuentas onEditarCuenta={manejarEditarCuenta} />
    </div>
  );
};

export default Cuentas;