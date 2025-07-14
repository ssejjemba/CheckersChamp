"use client";

import { RulesDialog } from "./rules-dialog";
import { SettingsDialog } from "./settings-dialog";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div>
        <h1 className="text-xl font-bold font-headline">
            Checkers<span className="text-primary">Champ</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <RulesDialog />
        <SettingsDialog />
      </div>
    </header>
  );
}
