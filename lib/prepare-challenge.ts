import { Chess, BLACK, WHITE, KING, Square, Piece } from "./chess.ts";
import { ValidPosition } from "./get-valid-games.ts";
import { checkSolution } from "../src/client/js/gameController.js";
import { SQUARES } from "../public/chess.js/chess.js";

const BLACK_KING: Piece = {
  color: BLACK,
  type: KING,
} as const;
const WHITE_KING: Piece = {
  color: WHITE,
  type: KING,
} as const;

/**
 * Challenge object with information for the puzzle
 */
type PlacedPiece = {
  piece: Piece;
  square: Square;
};
export type Challenge = {
  id: string;
  originalFen: string;
  challengeFen: string;
  kings: PlacedPiece[];
  removedPieces: PlacedPiece[];
  hint?: string;
};

/**
 * Prepares a challenge by removing pieces from the checkmate position
 */
export function prepareChallenge(position: ValidPosition): Challenge {
  const chess = new Chess(position.fen);

  // Determine which pieces to remove (this logic can be customized)
  const bkSquare = chess.findPiece(BLACK_KING)[0];
  const wkSquare = chess.findPiece(WHITE_KING)[0];
  if (!bkSquare || !wkSquare) {
    throw new Error("King not found");
  }
  const toRemove: PlacedPiece[] = [];

  const checkedKing = chess.isAttacked(bkSquare, WHITE)
    ? BLACK_KING
    : WHITE_KING;
  const checkedKingSquare = checkedKing === BLACK_KING ? bkSquare : wkSquare;
  const attackingKing = checkedKing === BLACK_KING ? WHITE_KING : BLACK_KING;

  // Get attacking pieces and add them to the removed ones
  const attackingPlacedPieces: PlacedPiece[] = chess
    .attackers(checkedKingSquare, attackingKing.color)
    .map((square) => ({
      square,
      piece: chess.get(square)!,
    }));

  toRemove.push(...attackingPlacedPieces);
  toRemove.push(
    ...[
      { piece: BLACK_KING, square: bkSquare },
      { piece: WHITE_KING, square: wkSquare },
    ]
  );

  // Remove up to 5 pieces
  let removedCount = toRemove.length;

  for (const pp of toRemove) {
    chess.remove(pp.square);
  }

  console.log(toRemove);

  //   // Get all pieces of the moving side
  //   for (let row = 0; row < 8; row++) {
  //     for (let col = 0; col < 8; col++) {
  //       const piece = board[row][col];

  //       // Skip empty squares or opponent's pieces
  //       if (!piece || piece.color !== moveColor) continue;

  //       // Skip the king (keep at least one king on each side)
  //       if (piece.type === "k") continue;

  //       // Select pieces to remove (you can implement more sophisticated logic here)
  //       if (Math.random() > 0.7 && removedCount < 2) {
  //         removedPieces.push({
  //           piece: piece.color + piece.type,
  //           square: piece.square,
  //         });

  //         // Remove the piece
  //         chess.remove(piece.square);
  //         removedCount++;
  //       }
  //     }
  //   }

  return {
    id: position.id,
    originalFen: position.fen,
    kings: [
      { piece: BLACK_KING, square: bkSquare },
      { piece: WHITE_KING, square: wkSquare },
    ],
    challengeFen: chess.fen(),
    removedPieces: toRemove,
    hint: `Place ${removedCount} piece(s) to create checkmate`,
  };
}
