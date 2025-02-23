import express from "npm:express";
import * as path from "jsr:@std/path";
import { Chess, WHITE, BLACK } from "npm:chess.js";
import { findKing } from "./lib/find-king.ts";
import { getValidPositions } from "./lib/get-valid-games.ts";

const app = express();
const PORT = Deno.env.get("PORT") || 3000;

const ruyLopez = "r1bqkb1r/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b - - 1";
const chess = new Chess(ruyLopez);

const board = chess.board();

// Find kings positions
const whiteKing = findKing(board, WHITE);
const blackKing = findKing(board, BLACK);
console.log(whiteKing, blackKing, import.meta.dirname);

// Get 10 games wuth checkmate
const games = await getValidPositions(new Date().getTime().toString());

// Serve everything in the 'public' folder
app.use(express.static(path.join(import.meta.dirname ?? "./", "public")));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
