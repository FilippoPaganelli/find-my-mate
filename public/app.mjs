import { Chess, WHITE } from "./chess.js/esm/chess.mjs";

const ruyLopez = "r1bqkb1r/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b - - 1";
const chess = new Chess(ruyLopez);

const config = {
  position: ruyLopez,
  draggable: true,
};
const board = ChessBoard("board", config);

const swapped = Object.fromEntries(
  Object.entries(board.position()).map(([key, value]) => [value, key])
);
const bk = swapped["bK"];
const wk = swapped["wK"];
console.log(swapped["bK"]);
console.log(chess.get(chess.attackers(bk, WHITE)));
