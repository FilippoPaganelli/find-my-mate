import { BLACK, WHITE } from "npm:chess.js";

export function findKing(
  board: ({ square: string; type: string; color: string } | null)[][],
  color: typeof BLACK | typeof WHITE
) {
  for (const row of board) {
    for (const piece of row) {
      if (piece && piece.type === "k" && piece.color === color) {
        return piece.square;
      }
    }
  }
  return null;
}
