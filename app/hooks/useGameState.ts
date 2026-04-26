import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

export const useGameState = () => {
  const context = useContext(GameContext);

  // Context now has a non-null default, but still validate for best practices
  if (!context || !context.state) {
    throw new Error('useGameState must be used within a GameProvider');
  }

  return context;
};
