import { useContext } from 'react';
import { AppContext } from './AppContext';

export const useAppState = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
};
