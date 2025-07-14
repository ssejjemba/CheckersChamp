"use client";

import { useContext } from 'react';
import { GameContext, GameContextType } from '@/components/providers/game-provider';

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
