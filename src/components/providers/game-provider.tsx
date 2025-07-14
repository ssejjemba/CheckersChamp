
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { BoardState, Player, Piece, LegalMove, Difficulty } from '@/lib/types';
import { createInitialBoard, BOARD_SIZE, isSquareOnBoard } from '@/lib/game-logic';
import { getMoveHint } from '@/ai/ai-move-hint';
import { convertBoardToString, convertAlphanumericToPos } from '@/lib/utils';

export interface GameContextType {
  board: BoardState;
  currentPlayer: Player;
  selectedPiece: { row: number; col: number } | null;
  legalMoves: LegalMove[];
  selectPiece: (row: number, col: number) => void;
  makeMove: (move: LegalMove) => void;
  resetGame: () => void;
  winner: Player | null;
  capturedPieces: { red: number; black: number };
  isAITurn: boolean;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
}

export const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<LegalMove[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [capturedPieces, setCapturedPieces] = useState({ red: 0, black: 0 });
  const [isAITurn, setIsAITurn] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('red');
    setSelectedPiece(null);
    setLegalMoves([]);
    setWinner(null);
    setCapturedPieces({ red: 0, black: 0 });
    setIsAITurn(false);
    setDifficulty('medium');
  }, []);

  const calculateLegalMoves = useCallback((piece: Piece, row: number, col: number, currentBoard: BoardState): LegalMove[] => {
    const moves: LegalMove[] = [];
    const player = piece.player;
    const isKing = piece.type === 'king';

    const directions = player === 'red' ? [-1] : [1];
    if (isKing) {
      directions.push(1, -1);
    }
    const moveDirs = isKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : player === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];

    // Regular moves
    for (const [dr, dc] of moveDirs) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (isSquareOnBoard(newRow, newCol) && !currentBoard[newRow][newCol]) {
            moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, isCapture: false });
        }
    }

    // Capture moves
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
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
    const captureMoves = moves.filter(m => m.isCapture);
    if (captureMoves.length > 0) {
      return captureMoves;
    }

    return moves;
  }, []);
  
  const selectPiece = useCallback((row: number, col: number) => {
    const piece = board[row][col];
    if (winner || isAITurn) return;

    if (piece && piece.player === currentPlayer) {
      setSelectedPiece({ row, col });
      const moves = calculateLegalMoves(piece, row, col, board);
      setLegalMoves(moves);
    } else {
      setSelectedPiece(null);
      setLegalMoves([]);
    }
  }, [board, currentPlayer, winner, calculateLegalMoves, isAITurn]);

  const makeMove = useCallback((move: LegalMove) => {
    let newBoard = board.map(r => r.slice());
    const piece = newBoard[move.from.row][move.from.col];
    if (!piece) return;

    // Move piece
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;
    
    // Handle captures
    if (move.isCapture && move.capturedPiecePos) {
      newBoard[move.capturedPiecePos.row][move.capturedPiecePos.col] = null;
      setCapturedPieces(prev => {
        const newCount = { ...prev };
        if (currentPlayer === 'red') newCount.black += 1;
        else newCount.red += 1;
        return newCount;
      });
    }

    // King me
    if ((piece.player === 'red' && move.to.row === 0) || (piece.player === 'black' && move.to.row === BOARD_SIZE - 1)) {
        (newBoard[move.to.row][move.to.col] as Piece).type = 'king';
    }

    setBoard(newBoard);
    setSelectedPiece(null);
    setLegalMoves([]);
    setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');

  }, [board, currentPlayer]);

  const triggerAIMove = useCallback(async () => {
    if (winner) return;
    setIsAITurn(true);
    
    try {
      const boardString = convertBoardToString(board);
      const hint = await getMoveHint({
        boardState: boardString,
        playerColor: 'black',
        difficulty: difficulty,
      });
      
      const fromPos = convertAlphanumericToPos(hint.from);
      const toPos = convertAlphanumericToPos(hint.to);

      if (fromPos && toPos) {
        const piece = board[fromPos.row][fromPos.col];
        if (piece && piece.player === 'black') {
          const possibleMoves = calculateLegalMoves(piece, fromPos.row, fromPos.col, board);
          const aiMove = possibleMoves.find(m => m.to.row === toPos.row && m.to.col === toPos.col);

          if (aiMove) {
            // Simulate thinking time
            setTimeout(() => {
              makeMove(aiMove);
              setIsAITurn(false);
            }, 1000);
            return;
          }
        }
      }
      
      // Fallback: if AI provides an invalid move, pick a random legal one.
      const allBlackMoves: LegalMove[] = [];
      board.forEach((row, r) => {
        row.forEach((p, c) => {
          if (p && p.player === 'black') {
            allBlackMoves.push(...calculateLegalMoves(p, r, c, board));
          }
        });
      });
      const captureMoves = allBlackMoves.filter(m => m.isCapture);
      const movesToConsider = captureMoves.length > 0 ? captureMoves : allBlackMoves;

      if (movesToConsider.length > 0) {
        const randomMove = movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
        setTimeout(() => {
          makeMove(randomMove);
          setIsAITurn(false);
        }, 1000);
      } else {
        setIsAITurn(false);
      }

    } catch (error) {
      console.error("Error getting AI move:", error);
      setIsAITurn(false);
      // Handle error, maybe make a random move as fallback
    }
  }, [board, winner, makeMove, calculateLegalMoves, difficulty]);


  useEffect(() => {
    if (currentPlayer === 'black' && !winner) {
      triggerAIMove();
    }
  }, [currentPlayer, winner, triggerAIMove]);

  useEffect(() => {
    const redPieces = board.flat().filter(p => p?.player === 'red').length;
    const blackPieces = board.flat().filter(p => p?.player === 'black').length;

    if(redPieces === 0) setWinner('black');
    if(blackPieces === 0) setWinner('red');

  }, [board]);


  const value = {
    board,
    currentPlayer,
    selectedPiece,
    legalMoves,
    selectPiece,
    makeMove,
    resetGame,
    winner,
    capturedPieces,
    isAITurn,
    difficulty,
    setDifficulty,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
