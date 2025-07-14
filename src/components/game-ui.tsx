"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { GameBoard } from './game-board';
import { PlayerInfo } from './player-info';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useGame } from '@/hooks/use-game';
import { Bot, RefreshCw, Sparkles, Users, Globe } from 'lucide-react';
import { Separator } from './ui/separator';
import { Header } from './header';

export function GameUI() {
    const { currentPlayer, resetGame, winner, capturedPieces } = useGame();
  
    return (
        <div className="flex flex-col h-screen">
          <Header />
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 p-4 md:p-6">
            {/* Left Panel */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline">Checkers Champ</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground px-1">Game Mode</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="secondary" className="flex-col h-16 gap-1"><Bot size={20} /> AI Player</Button>
                        <Button variant="outline" className="flex-col h-16 gap-1"><Users size={20} /> 1-on-1</Button>
                        <Button variant="outline" className="flex-col h-16 gap-1"><Globe size={20} /> Online</Button>
                    </div>
                </div>

                <Separator />
                
                <div className="flex flex-col gap-2">
                    <PlayerInfo 
                        player="red"
                        name="You"
                        avatarUrl="https://placehold.co/100x100.png"
                        data-ai-hint="person avatar"
                        capturedCount={capturedPieces.red}
                        isCurrentPlayer={currentPlayer === 'red'}
                    />
                    <PlayerInfo 
                        player="black"
                        name="AI Bot"
                        avatarUrl="https://placehold.co/100x100.png"
                        data-ai-hint="robot avatar"
                        capturedCount={capturedPieces.black}
                        isCurrentPlayer={currentPlayer === 'black'}
                    />
                </div>
                
                <AnimatePresence>
                    {!winner && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                            <div className="text-center p-3 bg-card rounded-lg border">
                                <p className="font-bold text-lg font-headline">
                                    {currentPlayer === 'red' ? "Your Turn" : "Black's Turn"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                <div className="mt-auto space-y-2">
                    <Button variant="secondary" className="w-full justify-start"><Sparkles /> Get a Hint</Button>
                    <Button onClick={resetGame} variant="destructive" className="w-full justify-start"><RefreshCw /> New Game</Button>
                </div>
              </CardContent>
            </Card>

            {/* Game Board Area */}
            <div className="flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
                >
                <GameBoard />
              </motion.div>
            </div>
          </div>
        </div>
    );
}
