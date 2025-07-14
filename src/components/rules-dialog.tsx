"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Info } from "lucide-react";

export function RulesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-5 w-5" />
          <span className="sr-only">Game Rules</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Checkers Rules (American)</DialogTitle>
          <DialogDescription>A quick guide to get you started.</DialogDescription>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto pr-4">
          <h4>Objective</h4>
          <p>The goal is to capture all of your opponent's pieces or block them so they have no legal moves.</p>
          
          <h4>Movement</h4>
          <ul>
            <li>Pieces move one diagonal square forward.</li>
            <li>Pieces can only move onto unoccupied dark squares.</li>
          </ul>

          <h4>Capturing</h4>
          <ul>
            <li>If your opponent's piece is on an adjacent diagonal square, you can "jump" over it to the next unoccupied square.</li>
            <li>The jumped piece is captured and removed from the board.</li>
            <li>If a capture is available, you <strong>must</strong> take it.</li>
            <li>Multiple jumps in a single turn are possible if sequential captures can be made. (Note: Multi-jumps not yet fully implemented in this version).</li>
          </ul>

          <h4>Kings</h4>
          <ul>
            <li>When one of your pieces reaches the last row on the opponent's side of the board, it is "crowned" and becomes a King.</li>
            <li>Kings can move diagonally forward and backward, giving them a significant advantage.</li>
          </ul>

          <h4>Winning</h4>
          <p>You win the game when your opponent has no pieces left or cannot make any legal moves.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
