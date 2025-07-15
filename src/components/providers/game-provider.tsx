/* game-provider.tsx
   — complete rewrite with a single, long-lived Web Worker and reliable AI turns —
*/

"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import type {
  BoardState,
  Player,
  Piece,
  LegalMove,
  Difficulty,
} from "@/lib/types";
import {
  createInitialBoard,
  calculateLegalMoves,
} from "@/lib/game-logic";
import { useToast } from "@/hooks/use-toast";

/* -------------------------------------------------------------------------- */
/*  Context types                                                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

export function GameProvider({ children }: { children: React.ReactNode }) {
  /* ---------------------------- state values ----------------------------- */
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("red");
  const [selectedPiece, setSelectedPiece] =
    useState<{ row: number; col: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<LegalMove[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [capturedPieces, setCapturedPieces] = useState({
    red: 0,
    black: 0,
  });
  const [isAITurn, setIsAITurn] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [isHintLoading, setIsHintLoading] = useState(false);

  /* ---------------------------- helpers ---------------------------------- */
  const { toast } = useToast();

  /* ---------------------------- worker refs ------------------------------ */
  const aiWorkerRef = useRef<Worker | null>(null);
  const isWorkerReady = useRef(false);

  /* ====================================================================== */
  /*  1.  Create the worker once (on mount)                                 */
  /* ====================================================================== */
  useEffect(() => {
    aiWorkerRef.current = new Worker(
    "ai.js",
      { type: "module" }
    );

    const worker = aiWorkerRef.current;

    const handleMessage = (
      event: MessageEvent<{
        bestMove: LegalMove | null;
        type: "move" | "hint";
      }>
    ) => {
      const { bestMove, type } = event.data;

      if (!bestMove) {
        if (type === "move") setIsAITurn(false);
        if (type === "hint") {
          setIsHintLoading(false);
          toast({
            variant: "destructive",
            title: "No hint available",
            description: "The AI could not find a suggested move.",
          });
        }
        return;
      }

      /* --------------------------- MOVE --------------------------- */
      if (type === "move") {
        setTimeout(() => {
          makeMove(bestMove);
          setIsAITurn(false);
        }, 400); // small “thinking” delay
      }

      /* --------------------------- HINT --------------------------- */
      if (type === "hint") {
        const piece = board[bestMove.from.row][bestMove.from.col];
        if (piece && piece.player === currentPlayer) {
          setSelectedPiece({ row: bestMove.from.row, col: bestMove.from.col });
          const moves = calculateLegalMoves(
            piece,
            bestMove.from.row,
            bestMove.from.col,
            board
          );
          setLegalMoves(moves);
        }
        setIsHintLoading(false);
        toast({
          title: "Hint received",
          description: `Try ${String.fromCharCode(
            97 + bestMove.from.col
          )}${8 - bestMove.from.row} → ${String.fromCharCode(
            97 + bestMove.to.col
          )}${8 - bestMove.to.row}`,
        });
      }
    };

    const handleError = (err: ErrorEvent) => {
      console.error("AI worker error:", err);
      setIsAITurn(false);
      setIsHintLoading(false);
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);

    isWorkerReady.current = true;

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
      worker.terminate();
    };
  }, [board, currentPlayer, toast]); // board & player needed here only for hint UI text

  /* ====================================================================== */
  /*  2.  Core actions                                                      */
  /* ====================================================================== */

  const makeMove = useCallback((move: LegalMove) => {
    setBoard((prevBoard) => {
      const piece = prevBoard[move.from.row][move.from.col];
      if (!piece) return prevBoard; // safety guard

      const nextBoard = prevBoard.map((row) => row.slice());

      /* Move the piece */
      nextBoard[move.to.row][move.to.col] = piece;
      nextBoard[move.from.row][move.from.col] = null;

      /* Handle capture */
      if (move.isCapture && move.capturedPiecePos) {
        nextBoard[move.capturedPiecePos.row][move.capturedPiecePos.col] = null;
        setCapturedPieces((prev) => {
          const updated = { ...prev };
          if (piece.player === "red") updated.black += 1;
          else updated.red += 1;
          return updated;
        });
      }

      /* Crown a king */
      const reachedEndForRed = piece.player === "red" && move.to.row === 0;
      const reachedEndForBlack = piece.player === "black" && move.to.row === 7;
      if (reachedEndForRed || reachedEndForBlack) {
        (nextBoard[move.to.row][move.to.col] as Piece).type = "king";
      }

      return nextBoard;
    });

    /* switch player and clear selections */
    setSelectedPiece(null);
    setLegalMoves([]);
    setCurrentPlayer((prev) => {
      console.log(`Player that just moved: ${prev}`);
      return prev === "red" ? "black" : "red";
    });
  }, []);

  const selectPiece = useCallback(
    (row: number, col: number) => {
      const piece = board[row][col];
      if (winner || isAITurn || isHintLoading) return;

      const isCurrentPiece = Boolean(
        selectedPiece &&
          selectedPiece.row === row &&
          selectedPiece.col === col
      );

      if (piece && piece.player === currentPlayer && !isCurrentPiece) {
        setSelectedPiece({ row, col });
        const moves = calculateLegalMoves(piece, row, col, board);
        setLegalMoves(moves);
      } else {
        setSelectedPiece(null);
        setLegalMoves([]);
      }
    },
    [board, currentPlayer, winner, isAITurn, selectedPiece, isHintLoading]
  );

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer("red");
    setSelectedPiece(null);
    setLegalMoves([]);
    setWinner(null);
    setCapturedPieces({ red: 0, black: 0 });
    setIsAITurn(false);
  }, []);

  /* ====================================================================== */
  /*  3.  AI commands                                                       */
  /* ====================================================================== */

  const triggerAIMove = useCallback(() => {
    if (winner || !isWorkerReady.current) return;

    setIsAITurn(true);
    aiWorkerRef.current?.postMessage({
      type: "move",
      board,
      player: "black",
      difficulty,
    });
  }, [board, winner, difficulty]);

  const getHint = useCallback(async () => {
    if (winner || isAITurn || isHintLoading || !isWorkerReady.current) return;

    setIsHintLoading(true);
    aiWorkerRef.current?.postMessage({
      type: "hint",
      board,
      player: currentPlayer,
      difficulty: "hard", // always use strongest search for hints
    });
  }, [board, winner, isAITurn, currentPlayer, isHintLoading]);

  /* ====================================================================== */
  /*  4.  Win / turn logic                                                  */
  /* ====================================================================== */

  useEffect(() => {
    /* ----- no pieces left  ----- */
    const redPieces = board.flat().filter((p) => p?.player === "red").length;
    const blackPieces = board.flat().filter((p) => p?.player === "black")
      .length;

    if (redPieces === 0) {
      setWinner("black");
      return;
    }
    if (blackPieces === 0) {
      setWinner("red");
      return;
    }

    /* ----- no legal moves for current player ----- */
    const playerHasMove = (player: Player) => {
      for (let r = 0; r < 8; r += 1) {
        for (let c = 0; c < 8; c += 1) {
          const piece = board[r][c];
          if (piece && piece.player === player) {
            if (calculateLegalMoves(piece, r, c, board).length > 0) {
              return true;
            }
          }
        }
      }
      return false;
    };

    if (!playerHasMove(currentPlayer)) {
      setWinner(currentPlayer === "red" ? "black" : "red");
      return;
    }

    /* ----- let the AI move when it’s black’s turn ----- */
    if (currentPlayer === "black" && !winner) {
      triggerAIMove();
    }
  }, [board, currentPlayer, winner, triggerAIMove]);

  /* ---------------------------------------------------------------------- */
  /*  Context value                                                         */
  /* ---------------------------------------------------------------------- */
  const value: GameContextType = {
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

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}
