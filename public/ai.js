
/// <reference lib="webworker" />

// Game Logic - Inlined from src/lib/game-logic.ts
const BOARD_SIZE = 8;

function isSquareOnBoard(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function calculateLegalMoves(piece, row, col, currentBoard) {
    const moves = [];
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
    const anyPieceCanCapture = (board, player) => {
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
    const calculateLegalMovesForPiece = (p, r, c, board) => {
      const pieceMoves = [];
      const pIsKing = p.type === 'king';
      // const pMoveDirs = pIsKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : p.player === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];

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


// AI Worker Logic - Inlined from src/workers/ai-worker.ts
const difficultyDepthMap = {
  easy: 1,
  medium: 3,
  hard: 5,
  expert: 7,
};

function evaluateBoard(board, player) {
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

function getAllLegalMoves(board, player) {
  const allMoves = [];
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

function minimax(board, depth, alpha, beta, maximizingPlayer, player) {
  if (depth === 0) {
    return [evaluateBoard(board, player), null];
  }

  const moves = getAllLegalMoves(board, maximizingPlayer ? player : (player === 'red' ? 'black' : 'red'));
  if (moves.length === 0) {
    // If no moves, it's a loss for the current player
    return [maximizingPlayer ? -Infinity : Infinity, null];
  }

  let bestMove = moves[0];
  
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

function simulateMove(board, move) {
  let newBoard = board.map(r => r.slice());
  const piece = newBoard[move.from.row][move.from.col];
  if (!piece) return newBoard;

  newBoard[move.to.row][move.to.col] = piece;
  newBoard[move.from.row][move.from.col] = null;
  
  if (move.isCapture && move.capturedPiecePos) {
    newBoard[move.capturedPiecePos.row][move.capturedPiecePos.col] = null;
  }

  if ((piece.player === 'red' && move.to.row === 0) || (piece.player === 'black' && move.to.row === BOARD_SIZE - 1)) {
    newBoard[move.to.row][move.to.col].type = 'king';
  }
  return newBoard;
}

self.onmessage = (event) => {
  const { board, player, difficulty, type } = event.data;
  const depth = difficultyDepthMap[difficulty];
  const [, bestMove] = minimax(board, depth, -Infinity, Infinity, true, player);
  self.postMessage({ bestMove, type });
};
