import { updateStatusDisplay } from "./ui.ts";
import { Chess } from "../../../public/chess.js/esm/chess.mjs";

// Shared state
let board = null;
let chess = null;
let challengeId = null;
let lockedSquares = new Set();

/**
 * Sets up the chessboard with event handlers for the challenge
 * @param {string} fen - FEN string for challenge position
 * @param {Array} removedPieces - Pieces that were removed
 * @param {string} id - Challenge ID
 * @returns {Object} - The chess instance and board
 */
export function setupChallenge(fen, removedPieces, id) {
  // Initialize chess logic
  chess = new Chess();
  chess.load(fen, { skipValidation: true });
  challengeId = id;

  // Track all initial pieces to lock them
  lockedSquares = new Set();
  const position = {};

  // Convert chess.js board representation to chessboard.js format
  const chessJsBoard = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = chessJsBoard[row][col];
      if (piece) {
        lockedSquares.add(piece.square);
        // Convert to chessboard.js format: color + piece type (e.g., 'wP', 'bK')
        position[piece.square] =
          (piece.color === "w" ? "w" : "b") + piece.type.toUpperCase();
      }
    }
  }

  // Initialize or update the board
  if (board) {
    board.destroy();
  }

  // Create the board with proper configuration
  board = ChessBoard("board", {
    position: position,
    draggable: true,
    sparePieces: true,
    orientation: "white",
    dropOffBoard: "trash",
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
  });

  // Set up spare pieces area with the removed pieces
  setupSparePieces(removedPieces);

  return { board, chess, challengeId };
}

/**
 * Set up spare pieces in the Chessboard.js UI
 * @param {Array} removedPieces - The pieces that were removed
 */
function setupSparePieces(removedPieces) {
  // Chessboard.js automatically creates the spare pieces UI
  // but we may need to update the count if we have multiple pieces of same type

  // Group pieces by type
  const pieceCount = {};

  removedPieces.forEach((pieceInfo) => {
    const piece = pieceInfo.piece; // Format is already 'wP', 'bQ', etc.
    pieceCount[piece] = (pieceCount[piece] || 0) + 1;
  });

  // Chessboard.js doesn't natively support multiple spare pieces of the same type
  // To handle multiple pieces, the UI module should be set up to show counts
}

/**
 * Chess piece drag start handler
 * @param {string} source - Source square
 * @param {string} piece - Piece type in chessboard.js format (e.g., 'wP', 'bK')
 * @returns {boolean} - Whether the drag is allowed
 */
function onDragStart(source, piece) {
  // Don't allow locked pieces to be moved
  if (source !== "spare" && lockedSquares.has(source)) {
    return false;
  }

  return true;
}

/**
 * Chess piece drop handler
 * @param {string} source - Source square or 'spare'
 * @param {string} target - Target square or 'offboard'
 * @param {string} piece - Piece type in chessboard.js format (e.g., 'wP', 'bK')
 * @param {Object} newPosition - New position in chessboard.js format
 * @param {Object} oldPosition - Old position in chessboard.js format
 * @returns {string|undefined} - 'snapback' if invalid move
 */
function onDrop(source, target, piece, newPosition, oldPosition) {
  console.log("onDrop");
  // If target is locked square, don't allow drop
  if (target !== "offboard" && lockedSquares.has(target)) {
    return "snapback";
  }

  // Update chess.js board state
  updateChessJsPosition(newPosition);
}

/**
 * Update the chess.js internal representation from a chessboard.js position
 * @param {Object} position - Position in chessboard.js format
 */
function updateChessJsPosition(position) {
  // Clear the board first
  chess.clear();

  // Add each piece from the chessboard.js position
  Object.entries(position).forEach(([square, piece]) => {
    const color = piece.charAt(0);
    const type = piece.charAt(1).toLowerCase();
    chess.put({ type, color }, square);
  });
}

/**
 * After a piece snap animation completes
 */
function onSnapEnd() {
  // Nothing needed here, since we update the chess.js position in onDrop
}

/**
 * Get current FEN of the board
 * @returns {string} - Current FEN
 */
export function getCurrentFen() {
  return chess.fen();
}

/**
 * Get current challenge ID
 * @returns {string} - Challenge ID
 */
export function getChallengeId() {
  return challengeId;
}

/**
 * Get the current board instance
 * @returns {Object} - The chessboard instance
 */
export function getBoard() {
  return board;
}

/**
 * Check if current position is checkmate
 * @returns {boolean} - True if checkmate
 */
export function isCheckmate() {
  return chess.isCheckmate();
}

/**
 * Reset the board to the initial position
 */
export function resetBoard() {
  if (board) {
    const currentPosition = board.position();

    // Keep only locked squares
    const initialPosition = {};
    for (const square of lockedSquares) {
      if (currentPosition[square]) {
        initialPosition[square] = currentPosition[square];
      }
    }

    board.position(initialPosition);
    updateChessJsPosition(initialPosition);
  }
}
