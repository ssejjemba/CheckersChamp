# **App Name**: Checkers Champ

## Core Features:

- Gameplay Modes: Single-player vs AI (Easy · Medium · Hard · Expert); Local 1-on-1 on the same device; Online multiplayer with Firebase matchmaking, friend invites, real-time sync, rankings
- Rule Variants: Switchable American (8×8) and International (10×10, flying kings, majority-capture) rules; Engine enforces movement, capture, and draw conditions per variant
- AI System: Adjustable search depth, heuristics, and randomness per difficulty; Runs in an isolate / background isolate for smooth UI; Optional move hints and undo (single-player only)
- Visual & UX Polish: Smooth piece, capture, king-crown, and win/lose animations; Google-Fonts-powered UI with light & dark themes and multiple board/piece skins; Accessible controls: drag-and-drop or tap-to-move with legal-move highlights
- Customization & Settings: Theme switcher (light/dark, colour skins); Language toggle (English ↔ German) with easy ARB-file expansion; Sound & music volume sliders
- Player Progress: Local & cloud-saved stats, win streaks, Elo/ladder ranking; Achievements that unlock extra boards, pieces, avatars; Saved game replays and per-move history viewer
- Onboarding & Help: Interactive tutorial for first-time players; In-app rules reference and basic strategy tips

## Style Guidelines:

- Primary (“Red piece”) `#D72631` — vivid but not neon, instantly recognisable as the attacking colour.
- Primary-dark (buttons / pressed states) `#AD1A26` — keeps depth without turning brown.
- Secondary (“Black piece”) `#1A1A1A` — a rich charcoal that stays distinct from true black on OLED screens.
- Secondary-light (hover / disabled) `#303030` — enough lift for outlines or subtle borders.
- Accent / Crown Gold `#FFB400` — pops for king icons, trophy animations, and call-to-action buttons.
- Headline font: 'Space Grotesk', a modern sans-serif font, to reflect board-game algorithms; body font: 'Inter', sans-serif.
- Clear and minimalist icons for menu options and in-game actions, designed for easy recognition and a clean interface.
- Subtle animations for piece movement and capturing, with celebratory effects upon winning a match, enhancing user engagement without being distracting.
- Background `#F5F5F7` — ultra-light neutral that flatters colourful boards.
- Surface / Card `#FFFFFF` with a 4 dp shadow — crisp panel look.
- Light square `#F3E5AB` (warm birch) • Dark square `#8B5A2B` (walnut)
- Background `#121212` — true Material dark, avoids grey haze.
- Surface / Card `#1E1E1E` — just enough elevation against the backdrop.
- Light square `#6D4C41` (milk-chocolate) • Dark square `#3E2723` (espresso)
- Success / “Your turn” highlight `#43A047`
- Error / illegal move `#E53935`
- Warning / time-low `#FB8C00`
- Info glow / legal-move dot `#42A5F5` (maintains visibility on both board woods)