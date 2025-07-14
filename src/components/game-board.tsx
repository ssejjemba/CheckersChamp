"use client";

import { useGame } from '@/hooks/use-game';
import { GameSquare } from './game-square';
import { AnimatePresence, motion } from 'framer-motion';

export function GameBoard() {
  const { board, selectedPiece, legalMoves, selectPiece, makeMove, winner } = useGame();

  const handleSquareClick = (row: number, col: number) => {
    if (winner) return;
    
    const legalMove = legalMoves.find(m => m.to.row === row && m.to.col === col);
    if (legalMove) {
      makeMove(legalMove);
    } else {
      selectPiece(row, col);
    }
  };

  return (
    <div className="relative aspect-square w-full max-w-[calc(100vh-12rem)] mx-auto bg-card shadow-2xl rounded-lg overflow-hidden border-4 border-card">
      <div className="grid grid-cols-8 grid-rows-8">
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => (
            <GameSquare
              key={`${rowIndex}-${colIndex}`}
              square={square}
              isLight={(rowIndex + colIndex) % 2 === 0}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              isLegalMove={legalMoves.some(m => m.to.row === rowIndex && m.to.col === colIndex)}
              isSelected={selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex}
            />
          ))
        )}
      </div>
      <AnimatePresence>
        {winner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center"
            >
              <div className="text-center text-white">
                <h2 className="text-5xl font-headline font-bold text-accent mb-2">
                  {winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!
                </h2>
                <p>Congratulations!</p>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
