import { cn } from '@/lib/utils';
import type { Square as SquareType } from '@/lib/types';
import { GamePiece } from './game-piece';

interface GameSquareProps {
  square: SquareType;
  isLight: boolean;
  onClick: () => void;
  isLegalMove: boolean;
  isSelected: boolean;
}

export function GameSquare({ square, isLight, onClick, isLegalMove, isSelected }: GameSquareProps) {
  const bgColor = isLight ? 'bg-light-square' : 'bg-dark-square';

  return (
    <div
      onClick={onClick}
      className={cn(
        'w-full h-full flex items-center justify-center relative aspect-square',
        bgColor,
        'transition-colors duration-200'
      )}
      role="button"
      aria-label={`Square ${isSelected ? 'selected' : ''}`}
    >
      {square && <GamePiece piece={square} isSelected={isSelected} />}
      {isLegalMove && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-info opacity-50"></div>
        </div>
      )}
    </div>
  );
}
