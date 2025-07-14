import type { BoardState, Player, Piece, LegalMove } from './types';

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


export const calculateLegalMoves = (piece: Piece, row: number, col: number, currentBoard: BoardState): LegalMove[] => {
    const moves: LegalMove[] = [];
    const player = piece.player;
    const isKing = piece.type === 'king';

    const moveDirs = isKing 
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
        : player === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];

    // Regular moves
    for (const [dr, dc] of moveDirs) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isSquareOnBoard(newRow, newCol) && !currentBoard[newRow][newCol]) {
            moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, isCapture: false });
        }
    }

    const allCaptureDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    // Capture moves
    for (const [dr, dc] of allCaptureDirs) {
      const opponentRow = row + dr;
      const opponentCol = col + dc;
      const landRow = row + dr * 2;
      const landCol = col + dc * 2;

      if (isSquareOnBoard(landRow, landCol) && isSquareOnBoard(opponentRow, opponentCol)) {
        const opponentPiece = currentBoard[opponentRow][opponentCol];
        const landSquare = currentBoard[landRow][landCol];
        if (opponentPiece && opponentPiece.player !== player && !landSquare) {
          if (isKing || (player === 'red' && dr < 0) || (player === 'black' && dr > 0)) {
            moves.push({ from: { row, col }, to: { row: landRow, col: landCol }, isCapture: true, capturedPiecePos: { row: opponentRow, col: opponentCol } });
          }
        }
      }
    }
    
    // In checkers, if a capture is available, it must be taken.
    const anyPieceCanCapture = (board: BoardState, player: Player): boolean => {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const p = board[r][c];
          if (p && p.player === player) {
            const pMoves = calculateLegalMovesForPiece(p, r, c, board);
            if(pMoves.some(m => m.isCapture)) {
              return true;
            }
          }
        }
      }
      return false;
    }

    // Helper to avoid infinite recursion
    const calculateLegalMovesForPiece = (p: Piece, r: number, c: number, board: BoardState): LegalMove[] => {
      const pieceMoves: LegalMove[] = [];
      const pIsKing = p.type === 'king';
      const pMoveDirs = pIsKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : p.player === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];

      for (const [dr, dc] of allCaptureDirs) {
          const oRow = r + dr;
          const oCol = c + dc;
          const lRow = r + dr * 2;
          const lCol = c + dc * 2;
          if (isSquareOnBoard(lRow, lCol) && isSquareOnBoard(oRow, oCol)) {
            const oPiece = board[oRow][oCol];
            const lSquare = board[lRow][lCol];
            if (oPiece && oPiece.player !== p.player && !lSquare) {
              if (pIsKing || (p.player === 'red' && dr < 0) || (p.player === 'black' && dr > 0)) {
                pieceMoves.push({ from: { row: r, col: c }, to: { row: lRow, col: lCol }, isCapture: true, capturedPiecePos: { row: oRow, col: oCol } });
              }
            }
          }
      }
      return pieceMoves;
    }

    if (anyPieceCanCapture(currentBoard, player)) {
      return moves.filter(m => m.isCapture);
    }

    return moves;
  };
