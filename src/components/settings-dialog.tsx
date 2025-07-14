"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { ThemeToggle } from "./theme-toggle";
import { Settings } from "lucide-react";

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <ThemeToggle />
          </div>
          <div className="space-y-4">
            <Label htmlFor="music-volume">Music Volume</Label>
            <Slider defaultValue={[50]} max={100} step={1} id="music-volume" />
          </div>
          <div className="space-y-4">
            <Label htmlFor="sound-volume">Sound Effects Volume</Label>
            <Slider defaultValue={[80]} max={100} step={1} id="sound-volume" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
