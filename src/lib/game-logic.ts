import type { BoardState, Player, Square } from './types';

export const BOARD_SIZE = 8;

export function createInitialBoard(): BoardState {
  const board: BoardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 !== 0) { // Dark squares
        if (row < 3) {
          board[row][col] = { player: 'black', type: 'man' };
        } else if (row > 4) {
          board[row][col] = { player: 'red', type: 'man' };
        }
      }
    }
  }
  return board;
}

export const isSquareOnBoard = (row: number, col: number) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}
