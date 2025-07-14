import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Piece } from '@/lib/types';

interface GamePieceProps {
  piece: Piece;
  isSelected: boolean;
}

const CrownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
  );
  

export function GamePiece({ piece, isSelected }: GamePieceProps) {
  const pieceColor = piece.player === 'red' ? 'bg-piece-red' : 'bg-piece-black';
  const pieceShadow = piece.player === 'red' ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)]' : 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.5)]';

  return (
    <motion.div
      layoutId={`piece-${piece.player}-${Math.random()}`} // A unique ID for animation, might need a better one for real app
      className={cn(
        'relative w-full h-full rounded-full cursor-pointer flex items-center justify-center transition-all duration-300',
        pieceColor,
        pieceShadow,
        isSelected ? 'ring-4 ring-offset-2 ring-accent dark:ring-offset-dark-square' : ''
      )}
      style={{
        width: '80%',
        height: '80%',
      }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {piece.type === 'king' && (
        <CrownIcon className="w-1/2 h-1/2 text-crown-gold" />
      )}
    </motion.div>
  );
}
