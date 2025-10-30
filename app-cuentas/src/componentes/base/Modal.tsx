import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  tamaño?: 'sm' | 'md' | 'lg' | 'xl';
  cerrarAlClickearFondo?: boolean;
  mostrarBotonCerrar?: boolean;
  children: React.ReactNode;
}

export interface ModalHeaderProps {
  children: React.ReactNode;
  onCerrar?: () => void;
}

export interface ModalBodyProps {
  children: React.ReactNode;
}

export interface ModalFooterProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({
  abierto,
  onCerrar,
  titulo,
  tamaño = 'md',
  cerrarAlClickearFondo = true,
  mostrarBotonCerrar = true,
  children
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fondoRef = useRef<HTMLDivElement>(null);

  // Manejar tecla Escape
  useEffect(() => {
    const manejarEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && abierto) {
        onCerrar();
      }
    };

    if (abierto) {
      document.addEventListener('keydown', manejarEscape);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', manejarEscape);
      document.body.style.overflow = 'unset';
    };
  }, [abierto, onCerrar]);

  // Focus trap
  useEffect(() => {
    if (abierto && modalRef.current) {
      const elementosFocusables = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const primerElemento = elementosFocusables[0] as HTMLElement;
      const ultimoElemento = elementosFocusables[elementosFocusables.length - 1] as HTMLElement;

      const manejarTab = (evento: KeyboardEvent) => {
        if (evento.key === 'Tab') {
          if (evento.shiftKey) {
            if (document.activeElement === primerElemento) {
              ultimoElemento?.focus();
              evento.preventDefault();
            }
          } else {
            if (document.activeElement === ultimoElemento) {
              primerElemento?.focus();
              evento.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', manejarTab);
      primerElemento?.focus();

      return () => {
        document.removeEventListener('keydown', manejarTab);
      };
    }
  }, [abierto]);

  const manejarClickFondo = (evento: React.MouseEvent) => {
    if (cerrarAlClickearFondo && evento.target === fondoRef.current) {
      onCerrar();
    }
  };

  if (!abierto) return null;

  const clases = [
    'modal',
    `modal--${tamaño}`
  ].join(' ');

  const contenidoModal = (
    <div 
      ref={fondoRef}
      className="modal-fondo" 
      onClick={manejarClickFondo}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titulo ? 'modal-titulo' : undefined}
    >
      <div ref={modalRef} className={clases}>
        {titulo && (
          <ModalHeader onCerrar={mostrarBotonCerrar ? onCerrar : undefined}>
            <h2 id="modal-titulo" className="modal-titulo">
              {titulo}
            </h2>
          </ModalHeader>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(contenidoModal, document.body);
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, onCerrar }) => {
  return (
    <div className="modal__header">
      {children}
      {onCerrar && (
        <button
          type="button"
          className="modal__boton-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar modal"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

const ModalBody: React.FC<ModalBodyProps> = ({ children }) => {
  return (
    <div className="modal__body">
      {children}
    </div>
  );
};

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <div className="modal__footer">
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;