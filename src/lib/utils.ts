import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BoardState, Piece } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertBoardToString(board: BoardState): string {
  let boardStr = "  a b c d e f g h\n";
  board.forEach((row, rowIndex) => {
    boardStr += `${8 - rowIndex} `;
    row.forEach((square, colIndex) => {
      if (square) {
        const piece = square as Piece;
        if (piece.player === 'red') {
          boardStr += piece.type === 'king' ? 'R' : 'r';
        } else {
          boardStr += piece.type === 'king' ? 'B' : 'b';
        }
      } else {
        boardStr += '.';
      }
      boardStr += ' ';
    });
    boardStr += `${8 - rowIndex}\n`;
  });
  boardStr += "  a b c d e f g h\n";
  return boardStr;
}

export function convertAlphanumericToPos(an: string): { row: number, col: number } | null {
  if (typeof an !== 'string' || an.length !== 2) return null;
  
  const colChar = an.charAt(0).toLowerCase();
  const rowChar = an.charAt(1);

  const col = colChar.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(rowChar, 10);

  if (col >= 0 && col < 8 && row >= 0 && row < 8) {
    return { row, col };
  }
  return null;
}
