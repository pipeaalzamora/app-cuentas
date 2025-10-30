import React from 'react';
import './Boton.css';

export interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'outline';
  tamaño?: 'sm' | 'md' | 'lg';
  cargando?: boolean;
  icono?: React.ReactNode;
  children: React.ReactNode;
}

const Boton: React.FC<BotonProps> = ({
  variante = 'primary',
  tamaño = 'md',
  cargando = false,
  icono,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const clases = [
    'boton',
    `boton--${variante}`,
    `boton--${tamaño}`,
    cargando && 'boton--cargando',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={clases}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <span className="boton__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="boton__spinner-icon">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="32"
            />
          </svg>
        </span>
      )}
      
      {icono && !cargando && (
        <span className="boton__icono" aria-hidden="true">
          {icono}
        </span>
      )}
      
      <span className="boton__texto">
        {children}
      </span>
    </button>
  );
};

export default Boton;