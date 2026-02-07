import React, { createContext, useContext, useState, useEffect } from 'react';

interface PeriodoContextType {
  mes: number;
  año: number;
  cambiarPeriodo: (mes: number, año: number) => void;
}

const PeriodoContext = createContext<PeriodoContextType | undefined>(undefined);

export const PeriodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mes, setMes] = useState<number>(() => {
    const guardado = localStorage.getItem('periodoActualMes');
    return guardado ? parseInt(guardado) : new Date().getMonth() + 1;
  });

  const [año, setAño] = useState<number>(() => {
    const guardado = localStorage.getItem('periodoActualAño');
    return guardado ? parseInt(guardado) : new Date().getFullYear();
  });

  const cambiarPeriodo = (nuevoMes: number, nuevoAño: number) => {
    setMes(nuevoMes);
    setAño(nuevoAño);
    localStorage.setItem('periodoActualMes', nuevoMes.toString());
    localStorage.setItem('periodoActualAño', nuevoAño.toString());
  };

  useEffect(() => {
    localStorage.setItem('periodoActualMes', mes.toString());
    localStorage.setItem('periodoActualAño', año.toString());
  }, [mes, año]);

  return (
    <PeriodoContext.Provider value={{ mes, año, cambiarPeriodo }}>
      {children}
    </PeriodoContext.Provider>
  );
};

export const usePeriodo = () => {
  const context = useContext(PeriodoContext);
  if (context === undefined) {
    throw new Error('usePeriodo debe ser usado dentro de un PeriodoProvider');
  }
  return context;
};
