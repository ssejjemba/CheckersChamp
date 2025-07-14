/// <reference lib="webworker" />
import type { BoardState, Player, LegalMove, Difficulty, Piece } from '@/lib/types';
import { calculateLegalMoves, BOARD_SIZE } from '@/lib/game-logic';

const difficultyDepthMap: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
  expert: 7,
};

function evaluateBoard(board: BoardState, player: Player): number {
  let score = 0;
  const opponent = player === 'red' ? 'black' : 'red';
  
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece) {
        let pieceScore = 1; // Man value
        if (piece.type === 'king') {
          pieceScore = 1.5; // King value
        }
        // Positional advantage
        if (piece.player === player) {
            score += pieceScore;
            // Add bonus for advancing for non-kings
            if (piece.type === 'man') {
                if(player === 'black') score += r * 0.1;
                else score += (7-r) * 0.1;
            }
        } else {
            score -= pieceScore;
            if (piece.type === 'man') {
                if(opponent === 'black') score -= r * 0.1;
                else score -= (7-r) * 0.1;
            }
        }
      }
    }
  }
  return score;
}

function getAllLegalMoves(board: BoardState, player: Player): LegalMove[] {
  const allMoves: LegalMove[] = [];
  let captureFound = false;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.player === player) {
        const moves = calculateLegalMoves(piece, r, c, board);
        if (moves.some(m => m.isCapture)) {
          captureFound = true;
        }
        allMoves.push(...moves);
      }
    }
  }
  if (captureFound) {
    return allMoves.filter(m => m.isCapture);
  }
  return allMoves;
}

function minimax(board: BoardState, depth: number, alpha: number, beta: number, maximizingPlayer: boolean, player: Player): [number, LegalMove | null] {
  if (depth === 0) {
    return [evaluateBoard(board, player), null];
  }

  const moves = getAllLegalMoves(board, maximizingPlayer ? player : (player === 'red' ? 'black' : 'red'));
  if (moves.length === 0) {
    // If no moves, it's a loss for the current player
    return [maximizingPlayer ? -Infinity : Infinity, null];
  }

  let bestMove: LegalMove | null = moves[0];
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = simulateMove(board, move);
      const [currentEval] = minimax(newBoard, depth - 1, alpha, beta, false, player);
      if (currentEval > maxEval) {
        maxEval = currentEval;
        bestMove = move;
      }
      alpha = Math.max(alpha, currentEval);
      if (beta <= alpha) {
        break; // Beta cut-off
      }
    }
    return [maxEval, bestMove];
  } else { // Minimizing player
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = simulateMove(board, move);
      const [currentEval] = minimax(newBoard, depth - 1, alpha, beta, true, player);
       if (currentEval < minEval) {
        minEval = currentEval;
        bestMove = move;
      }
      beta = Math.min(beta, currentEval);
      if (beta <= alpha) {
        break; // Alpha cut-off
      }
    }
    return [minEval, bestMove];
  }
}

function simulateMove(board: BoardState, move: LegalMove): BoardState {
  let newBoard = board.map(r => r.slice());
  const piece = newBoard[move.from.row][move.from.col];
  if (!piece) return newBoard;

  newBoard[move.to.row][move.to.col] = piece;
  newBoard[move.from.row][move.from.col] = null;
  
  if (move.isCapture && move.capturedPiecePos) {
    newBoard[move.capturedPiecePos.row][move.capturedPiecePos.col] = null;
  }

  if ((piece.player === 'red' && move.to.row === 0) || (piece.player === 'black' && move.to.row === BOARD_SIZE - 1)) {
    (newBoard[move.to.row][move.to.col] as Piece).type = 'king';
  }
  return newBoard;
}

self.onmessage = (event: MessageEvent<{ board: BoardState, player: Player, difficulty: Difficulty, type: 'move' | 'hint' }>) => {
  const { board, player, difficulty, type } = event.data;
  const depth = difficultyDepthMap[difficulty];
  const [, bestMove] = minimax(board, depth, -Infinity, Infinity, true, player);
  self.postMessage({ bestMove, type });
};
