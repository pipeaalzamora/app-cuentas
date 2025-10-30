import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TemaContextType {
  temaOscuro: boolean;
  alternarTema: () => void;
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

interface TemaProviderProps {
  children: ReactNode;
}

export const TemaProvider: React.FC<TemaProviderProps> = ({ children }) => {
  const [temaOscuro, setTemaOscuro] = useState<boolean>(() => {
    // Verificar preferencia guardada en localStorage
    const temaGuardado = localStorage.getItem('tema-oscuro');
    if (temaGuardado !== null) {
      return JSON.parse(temaGuardado);
    }
    
    // Si no hay preferencia guardada, usar la preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar el tema al documento
  useEffect(() => {
    const root = document.documentElement;
    if (temaOscuro) {
      root.classList.add('tema-oscuro');
    } else {
      root.classList.remove('tema-oscuro');
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem('tema-oscuro', JSON.stringify(temaOscuro));
  }, [temaOscuro]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo cambiar si no hay preferencia guardada
      const temaGuardado = localStorage.getItem('tema-oscuro');
      if (temaGuardado === null) {
        setTemaOscuro(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const alternarTema = () => {
    setTemaOscuro(prev => !prev);
  };

  const valor: TemaContextType = {
    temaOscuro,
    alternarTema
  };

  return (
    <TemaContext.Provider value={valor}>
      {children}
    </TemaContext.Provider>
  );
};

export const useTema = (): TemaContextType => {
  const contexto = useContext(TemaContext);
  if (contexto === undefined) {
    throw new Error('useTema debe ser usado dentro de un TemaProvider');
  }
  return contexto;
};

export default TemaContext;