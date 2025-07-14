
"use client";

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { BoardState, Player, Piece, LegalMove, Difficulty } from '@/lib/types';
import { createInitialBoard, calculateLegalMoves } from '@/lib/game-logic';
import { useToast } from '@/hooks/use-toast';

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
  getHint: () => Promise<void>;
  isHintLoading: boolean;
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
  const [isHintLoading, setIsHintLoading] = useState(false);
  
  const { toast } = useToast();
  const aiWorkerRef = useRef<Worker>();
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  const makeMove = useCallback((move: LegalMove) => {
    setBoard(currentBoard => {
      const pieceToMove = currentBoard[move.from.row][move.from.col];

      if (!pieceToMove) {
        return currentBoard; 
      }
  
      let newBoard = currentBoard.map(r => r.slice());
      const piece = newBoard[move.from.row][move.from.col];
      if (!piece) return newBoard;
  
      newBoard[move.to.row][move.to.col] = piece;
      newBoard[move.from.row][move.from.col] = null;
      
      if (move.isCapture && move.capturedPiecePos) {
        newBoard[move.capturedPiecePos.row][move.capturedPiecePos.col] = null;
        setCapturedPieces(prev => {
          const newCount = { ...prev };
          if (piece.player === 'red') newCount.black += 1;
          else newCount.red += 1;
          return newCount;
        });
      }
  
      if ((piece.player === 'red' && move.to.row === 0) || (piece.player === 'black' && move.to.row === 7)) {
          (newBoard[move.to.row][move.to.col] as Piece).type = 'king';
      }
      
      setSelectedPiece(null);
      setLegalMoves([]);
      setCurrentPlayer(prevPlayer => (prevPlayer === 'red' ? 'black' : 'red'));
      return newBoard;
    });
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('red');
    setSelectedPiece(null);
    setLegalMoves([]);
    setWinner(null);
    setCapturedPieces({ red: 0, black: 0 });
    setIsAITurn(false);
  }, []);

  const selectPiece = useCallback((row: number, col: number) => {
    const piece = board[row][col];
    if (winner || isAITurn || isHintLoading) return;

    if (piece && piece.player === currentPlayer) {
      if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null);
        setLegalMoves([]);
      } else {
        setSelectedPiece({ row, col });
        const moves = calculateLegalMoves(piece, row, col, board);
        setLegalMoves(moves);
      }
    } else {
      setSelectedPiece(null);
      setLegalMoves([]);
    }
  }, [board, currentPlayer, winner, isAITurn, selectedPiece, isHintLoading]);
  
  // Setup AI Worker
  useEffect(() => {
    aiWorkerRef.current = new Worker(new URL('../../workers/ai-worker.ts', import.meta.url));
    setIsWorkerReady(true);
    
    const messageHandler = (event: MessageEvent<{ bestMove: LegalMove | null, type: 'move' | 'hint' }>) => {
      const { bestMove, type } = event.data;
      if (bestMove) {
        if (type === 'move') {
          setTimeout(() => {
            makeMove(bestMove);
            setIsAITurn(false);
          }, 500);
        } else if (type === 'hint') {
          const piece = board[bestMove.from.row][bestMove.from.col];
           if (piece && piece.player === currentPlayer) {
            setSelectedPiece({ row: bestMove.from.row, col: bestMove.from.col });
            const moves = calculateLegalMoves(piece, bestMove.from.row, bestMove.from.col, board);
            setLegalMoves(moves);
          }
          setIsHintLoading(false);
          toast({
            title: "Hint Received",
            description: `Try moving from ${String.fromCharCode(97 + bestMove.from.col)}${8 - bestMove.from.row} to ${String.fromCharCode(97 + bestMove.to.col)}${8 - bestMove.to.row}.`
          });
        }
      } else {
        if (type === 'move') {
           setIsAITurn(false);
        }
        if (type === 'hint') {
            setIsHintLoading(false);
            toast({
                variant: 'destructive',
                title: "No hint available",
                description: "The AI could not find a suggested move.",
            });
        }
      }
    };

    aiWorkerRef.current.addEventListener('message', messageHandler);

    return () => {
      aiWorkerRef.current?.removeEventListener('message', messageHandler);
      aiWorkerRef.current?.terminate();
      setIsWorkerReady(false);
    };
  }, [board, currentPlayer, makeMove, toast]);

  const triggerAIMove = useCallback(() => {
    if (winner || !isWorkerReady) return;
    setIsAITurn(true);
    aiWorkerRef.current?.postMessage({
      type: 'move',
      board,
      player: 'black',
      difficulty,
    });
  }, [board, winner, difficulty, isWorkerReady]);

  const getHint = useCallback(async () => {
    if (winner || isAITurn || isHintLoading || !isWorkerReady) return;
    setIsHintLoading(true);
    aiWorkerRef.current?.postMessage({
        type: 'hint',
        board,
        player: currentPlayer,
        difficulty: 'hard',
    });
  }, [board, winner, isAITurn, currentPlayer, isHintLoading, isWorkerReady]);

  // Game state management effect
  useEffect(() => {
    if (!isWorkerReady) return;

    const redPieces = board.flat().filter(p => p?.player === 'red').length;
    const blackPieces = board.flat().filter(p => p?.player === 'black').length;

    if (redPieces === 0) {
      setWinner('black');
      return;
    }
    if (blackPieces === 0) {
      setWinner('red');
      return;
    }

    const hasLegalMoves = (player: Player) => {
        for(let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.player === player) {
                    const moves = calculateLegalMoves(piece, r, c, board);
                    if (moves.length > 0) return true;
                }
            }
        }
        return false;
    }

    if (!hasLegalMoves(currentPlayer)) {
        setWinner(currentPlayer === 'red' ? 'black' : 'red');
        return;
    }

    if (currentPlayer === 'black' && !winner) {
      triggerAIMove();
    }
  }, [board, currentPlayer, winner, triggerAIMove, isWorkerReady]);

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
    getHint,
    isHintLoading,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
