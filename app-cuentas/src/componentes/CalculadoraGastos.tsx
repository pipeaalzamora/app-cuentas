import React, { useState, useEffect } from 'react';
import type { CalculadoraGastos as CalculadoraGastosType } from '../tipos/calculadoraGastos';
import { servicioCalculadoraGastos } from '../servicios/calculadoraGastos';
import { calculadoraGastosAPI } from '../servicios/calculadoraGastosAPI';
import { servicioGeneradorPDF } from '../servicios/generadorPDF';
import { Boton, Input, Tarjeta, Modal } from './index';
import './CalculadoraGastos.css';

const formatearPesosChilenos = (monto: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(monto);
};

const formatearNumeroConPuntos = (valor: string): string => {
  const numero = valor.replace(/\D/g, '');
  if (!numero) return '';
  return new Intl.NumberFormat('es-CL').format(parseInt(numero));
};

const limpiarNumero = (valor: string): string => {
  return valor.replace(/\D/g, '');
};

const CalculadoraGastos: React.FC = () => {
  const [calculadora, setCalculadora] = useState<CalculadoraGastosType | null>(null);
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false);
  const [mostrarConfirmacionEliminarTodos, setMostrarConfirmacionEliminarTodos] = useState(false);
  
  // Form gasto
  const [titulo, setTitulo] = useState('');
  const [monto, setMonto] = useState('');
  const [cantidad, setCantidad] = useState('1');

  useEffect(() => {
    cargarCalculadora();
  }, []);

  const cargarCalculadora = async () => {
    try {
      console.log('Cargando calculadora...');
      const calc = await servicioCalculadoraGastos.obtenerCalculadora();
      console.log('Calculadora obtenida:', calc);
      if (calc) {
        setCalculadora(calc);
      }
    } catch (error) {
      console.error('Error al cargar calculadora:', error);
    }
  };

  const agregarGasto = async () => {
    if (!titulo || !monto || !cantidad) return;

    const montoLimpio = limpiarNumero(monto);
    const montoNum = parseFloat(montoLimpio);
    const cantidadNum = parseInt(cantidad);
    
    if (isNaN(montoNum) || montoNum <= 0) return;
    if (isNaN(cantidadNum) || cantidadNum <= 0) return;

    const nuevoGasto = {
      titulo,
      monto: montoNum,
      cantidad: cantidadNum
    };

    try {
      await calculadoraGastosAPI.agregarGasto(nuevoGasto);
      
      // Recargar la calculadora
      await cargarCalculadora();
      
      // Reset form
      setTitulo('');
      setMonto('');
      setCantidad('1');
      setMostrarFormGasto(false);
    } catch (error) {
      console.error('Error al agregar gasto:', error);
    }
  };

  const eliminarGasto = async (gastoId: string) => {
    try {
      await calculadoraGastosAPI.eliminarGasto(gastoId);
      await cargarCalculadora();
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
    }
  };

  const eliminarTodosGastos = async () => {
    try {
      await calculadoraGastosAPI.eliminarTodos();
      await cargarCalculadora();
      setMostrarConfirmacionEliminarTodos(false);
    } catch (error) {
      console.error('Error al eliminar todos los gastos:', error);
    }
  };

  const generarPDF = () => {
    if (!calculadora) return;
    
    const resumen = servicioCalculadoraGastos.calcularResumen(calculadora);
    servicioGeneradorPDF.generarReporteCalculadora(calculadora, resumen);
  };

  const resumen = calculadora ? servicioCalculadoraGastos.calcularResumen(calculadora) : null;

  if (!calculadora) {
    return (
      <div className="calculadora-container">
        <Tarjeta>
          <h2>Cargando...</h2>
        </Tarjeta>
      </div>
    );
  }

  return (
    <div className="calculadora-container">
      <Tarjeta>
        <div className="calculadora-header">
          <div className="header-info">
            <h2>🧮 Calculadora de Gastos</h2>
            <p className="calculadora-descripcion">Registra tus gastos de forma simple</p>
          </div>
          <div className="header-acciones">
            {calculadora.gastos.length > 0 && (
              <>
                <Boton 
                  onClick={() => setMostrarConfirmacionEliminarTodos(true)} 
                  variante="outline"
                >
                  Limpiar Todo
                </Boton>
                <Boton onClick={generarPDF} variante="secondary">
                  Descargar PDF
                </Boton>
              </>
            )}
          </div>
        </div>

        <div className="resumen-calculadora">
          <div className="resumen-item destacado">
            <span className="label">Total:</span>
            <span className="valor total">{formatearPesosChilenos(resumen?.totalGastos || 0)}</span>
          </div>
          <div className="resumen-item">
            <span className="label">Gastos registrados:</span>
            <span className="valor">{resumen?.cantidadGastos || 0}</span>
          </div>
        </div>

        <div className="acciones">
          <Boton onClick={() => setMostrarFormGasto(true)} variante="primary" className="btn-agregar-grande">
            + Agregar Gasto
          </Boton>
        </div>

        <div className="lista-gastos">
          {calculadora.gastos.length === 0 ? (
            <div className="sin-gastos-calculadora">
              <span className="icono-vacio">📝</span>
              <p>No hay gastos registrados</p>
              <p className="texto-secundario">Comienza agregando tu primer gasto</p>
            </div>
          ) : (
            <div className="gastos-grid">
              {calculadora.gastos.map(gasto => (
                <div key={gasto.id} className="gasto-item calculadora">
                  <div className="gasto-info">
                    <span className="gasto-titulo">{gasto.titulo}</span>
                    {gasto.cantidad > 1 && (
                      <span className="gasto-detalle">
                        {formatearPesosChilenos(gasto.monto)} × {gasto.cantidad}
                      </span>
                    )}
                    <span className="gasto-fecha">
                      {gasto.fecha.toLocaleDateString('es-CL', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="gasto-acciones">
                    <span className="gasto-monto-total">{formatearPesosChilenos(gasto.monto * gasto.cantidad)}</span>
                    <button 
                      className="btn-eliminar"
                      onClick={() => eliminarGasto(gasto.id)}
                      aria-label="Eliminar gasto"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Tarjeta>

      {mostrarFormGasto && (
        <Modal
          abierto={mostrarFormGasto}
          titulo="Agregar Gasto"
          onCerrar={() => {
            setTitulo('');
            setMonto('');
            setCantidad('1');
            setMostrarFormGasto(false);
          }}
        >
          <Modal.Body>
            <div className="form-gasto">
              <Input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Supermercado, Bencina, etc."
                etiqueta="Título del gasto"
              />
              <div className="form-multiplicador">
                <Input
                  type="text"
                  value={monto}
                  onChange={(e) => {
                    const limpio = limpiarNumero(e.target.value);
                    setMonto(limpio ? formatearNumeroConPuntos(limpio) : '');
                  }}
                  placeholder="Ej: 50.000"
                  etiqueta="Monto"
                />
                <span className="multiplicador-simbolo">×</span>
                <Input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="1"
                  etiqueta="Cantidad"
                />
                <div className="total-calculado">
                  <span className="label-total">Total:</span>
                  <span className="valor-total">
                    {monto && cantidad ? formatearPesosChilenos(parseFloat(limpiarNumero(monto)) * parseInt(cantidad || '1')) : '$0'}
                  </span>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Boton 
              onClick={() => {
                setTitulo('');
                setMonto('');
                setCantidad('1');
                setMostrarFormGasto(false);
              }} 
              variante="outline"
            >
              Cancelar
            </Boton>
            <Boton onClick={agregarGasto} variante="primary">
              Agregar
            </Boton>
          </Modal.Footer>
        </Modal>
      )}

      {mostrarConfirmacionEliminarTodos && (
        <Modal
          abierto={mostrarConfirmacionEliminarTodos}
          titulo="¿Eliminar todos los gastos?"
          onCerrar={() => setMostrarConfirmacionEliminarTodos(false)}
        >
          <Modal.Body>
            <p>Esta acción eliminará todos los gastos registrados y no se puede deshacer.</p>
            <p><strong>Total a eliminar: {formatearPesosChilenos(resumen?.totalGastos || 0)}</strong></p>
          </Modal.Body>
          <Modal.Footer>
            <Boton onClick={() => setMostrarConfirmacionEliminarTodos(false)} variante="outline">
              Cancelar
            </Boton>
            <Boton onClick={eliminarTodosGastos} variante="primary">
              Eliminar Todo
            </Boton>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default CalculadoraGastos;
