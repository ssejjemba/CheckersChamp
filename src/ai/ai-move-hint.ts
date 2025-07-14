// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-powered move hints in a checkers game.
 *
 * - `getMoveHint` - A function that takes the current board state and returns a suggested move.
 * - `MoveHintInput` - The input type for the `getMoveHint` function, representing the current game state.
 * - `MoveHintOutput` - The output type for the `getMoveHint` function, representing the suggested move.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BoardStateSchema = z.string().describe('A string representation of the current checkers board state.');
const PlayerColorSchema = z.enum(['red', 'black']).describe('The color of the player requesting the move hint.');

const MoveHintInputSchema = z.object({
  boardState: BoardStateSchema,
  playerColor: PlayerColorSchema,
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium').describe('The difficulty level of the AI providing the hint.'),
});
export type MoveHintInput = z.infer<typeof MoveHintInputSchema>;

const MoveHintOutputSchema = z.object({
  from: z.string().describe('The starting position of the piece to move (e.g., \'A1\').'),
  to: z.string().describe('The destination position of the piece (e.g., \'B2\').'),
  reason: z.string().optional().describe('The AI reasoning for this move. Optional.'),
});
export type MoveHintOutput = z.infer<typeof MoveHintOutputSchema>;

export async function getMoveHint(input: MoveHintInput): Promise<MoveHintOutput> {
  return moveHintFlow(input);
}

const moveHintPrompt = ai.definePrompt({
  name: 'moveHintPrompt',
  input: {
    schema: MoveHintInputSchema,
  },
  output: {
    schema: MoveHintOutputSchema,
  },
  prompt: `You are an expert checkers strategist. Given the current board state and the player\'s color, suggest the best move for the player.

Board State:
{{boardState}}

Player Color: {{playerColor}}

Difficulty: {{difficulty}}

Suggest a move in the format:
{
  "from": "[starting position]",
  "to": "[destination position]",
  "reason": "[AI reasoning for this move]"
}

Consider the difficulty level when providing the hint.  Easy difficulty should provide more obvious, less strategic moves. Expert difficulty should provide the best possible move, even if it is not immediately obvious.
`,
});

const moveHintFlow = ai.defineFlow(
  {
    name: 'moveHintFlow',
    inputSchema: MoveHintInputSchema,
    outputSchema: MoveHintOutputSchema,
  },
  async input => {
    const {output} = await moveHintPrompt(input);
    return output!;
  }
);
