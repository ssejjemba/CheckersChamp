import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GamePiece } from "./game-piece";
import { Player } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlayerInfoProps {
  player: Player;
  name: string;
  avatarUrl?: string;
  capturedCount: number;
  isCurrentPlayer: boolean;
  isThinking?: boolean;
}

export function PlayerInfo({ player, name, avatarUrl, capturedCount, isCurrentPlayer, isThinking }: PlayerInfoProps) {
  const avatarInitial = name.charAt(0).toUpperCase();
  return (
    <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all",
        isCurrentPlayer ? "bg-accent/20" : "bg-card"
    )}>
      <Avatar>
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{avatarInitial}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold font-headline">{name}</p>
        <p className="text-sm text-muted-foreground">{isThinking ? 'Thinking...' : 'AI - Medium'}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6">
            <GamePiece piece={{ player: player === 'red' ? 'black' : 'red', type: 'man' }} isSelected={false}/>
        </div>
        <span className="font-bold text-lg">{capturedCount}</span>
      </div>
    </div>
  );
}
