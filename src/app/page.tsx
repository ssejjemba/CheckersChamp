import { GameProvider } from "@/components/providers/game-provider";
import { GameUI } from "@/components/game-ui";

export default function Home() {
  return (
    <GameProvider>
      <main className="min-h-screen bg-background">
        <GameUI />
      </main>
    </GameProvider>
  );
}
