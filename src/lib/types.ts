
export type Player = 'red' | 'black';
export type PieceType = 'man' | 'king';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Piece {
  player: Player;
  type: PieceType;
}

export type Square = Piece | null;
export type BoardState = Square[][];

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
}

export interface LegalMove extends Move {
  isCapture: boolean;
  capturedPiecePos?: { row: number; col: number };
}
