import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
  ayuda?: string;
  icono?: React.ReactNode;
  iconoDerecha?: React.ReactNode;
  tamaño?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  etiqueta,
  error,
  ayuda,
  icono,
  iconoDerecha,
  tamaño = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const tieneError = Boolean(error);
  
  const clases = [
    'input-wrapper',
    `input-wrapper--${tamaño}`,
    tieneError && 'input-wrapper--error',
    props.disabled && 'input-wrapper--disabled',
    className
  ].filter(Boolean).join(' ');

  const clasesInput = [
    'input',
    icono && 'input--con-icono-izquierdo',
    iconoDerecha && 'input--con-icono-derecho'
  ].filter(Boolean).join(' ');

  return (
    <div className={clases}>
      {etiqueta && (
        <label htmlFor={inputId} className="input-etiqueta">
          {etiqueta}
        </label>
      )}
      
      <div className="input-contenedor">
        {icono && (
          <span className="input-icono input-icono--izquierdo" aria-hidden="true">
            {icono}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={clasesInput}
          aria-invalid={tieneError}
          aria-describedby={
            error ? `${inputId}-error` : 
            ayuda ? `${inputId}-ayuda` : 
            undefined
          }
          {...props}
        />
        
        {iconoDerecha && (
          <span className="input-icono input-icono--derecho" aria-hidden="true">
            {iconoDerecha}
          </span>
        )}
      </div>
      
      {error && (
        <span id={`${inputId}-error`} className="input-mensaje input-mensaje--error" role="alert">
          {error}
        </span>
      )}
      
      {ayuda && !error && (
        <span id={`${inputId}-ayuda`} className="input-mensaje input-mensaje--ayuda">
          {ayuda}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;