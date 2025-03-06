/// <reference lib="deno.ns" />
import * as path from "jsr:@std/path";
import * as fs from "jsr:@std/fs";
import { getValidPositions } from "../../lib/get-valid-games.ts";
import { prepareChallenge } from "../../lib/prepare-challenge.ts";
import { Chess } from "../../lib/chess.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();
const PORT = Deno.env.get("PORT") || 3000;

// Get games with checkmate
const validPositions = await getValidPositions(new Date().getTime().toString());

// Store solved positions
const solvedIds = new Set<string>();
const SOLVED_FILE = path.join(import.meta.dirname ?? "./", "data/solved.json");

// Load previously solved positions if file exists
try {
  if (await fs.exists(SOLVED_FILE)) {
    const data = JSON.parse(await Deno.readTextFile(SOLVED_FILE)) as string[];
    data.forEach((posId: string) => solvedIds.add(posId));
    console.log(`INFO: loaded ${solvedIds.size} previously solved positions`);
  }
} catch (error) {
  console.error("ERROR: loading solved positions:", error);
}

// ################ API Endpoints ################

// API endpoint to get a random checkmate challenge
router.get("/api/position", ({ response }) => {
  // Filter out solved positions
  const availablePositions = validPositions.filter(
    (game) => !solvedIds.has(game.id)
  );

  if (availablePositions.length === 0) {
    console.error("ERROR: No more positions available");
    response.status = 404;
    response.body = { error: "No more positions available" };
    return;
  }

  // Select a random position
  const randomIndex = Math.floor(Math.random() * availablePositions.length);
  const position = availablePositions[randomIndex];
  const challenge = prepareChallenge(position);
  response.body = challenge;
});

// API endpoint to check if solution is correct
router.post("/api/check-solution", async ({ request, response }) => {
  try {
    const { posId, proposedFen } = await request.body.json();

    if (!posId || !proposedFen) {
      console.error("ERROR: Position ID and FEN required");
      response.status = 400;
      response.body = { error: "Position ID and FEN required" };
      return;
    }

    // Find the original position
    const originalPosition = validPositions.find((pos) => pos.id === posId);
    if (!originalPosition) {
      console.error("ERROR: Position ID not found:", posId);
      response.status = 404;
      response.body = { error: "Position ID not found" };
      return;
    }

    const chess = new Chess(proposedFen);
    if (!chess.isCheckmate()) {
      console.error("ERROR: invalid checkmate:", proposedFen);
      response.body = {
        correct: false,
        message: "Your solution is not a checkmate.",
      };
      return;
    }

    // Compare with original position to see if it's the expected solution
    const isCorrect = proposedFen === originalPosition.fen;
    console.log(proposedFen, originalPosition.fen);

    response.body = {
      correct: isCorrect,
      message: isCorrect
        ? "Correct! That's the right solution!"
        : "That's a valid checkmate, but not the one we're looking for.",
    };
    // deno-lint-ignore no-explicit-any
  } catch (error: any) {
    console.error("ERROR: checking solution:", error);
    response.status = 400;
    response.body = { error: error.message ?? "Invalid request" };
  }
});

// API endpoint to mark a position as solved
router.post("/api/solved", async ({ request, response }) => {
  const { posId } = await request.body.json();

  if (!posId) {
    console.error("ERROR: Position ID required");
    response.status = 400;
    response.body = { error: "Position ID required" };
    return;
  }

  if (!validPositions.some((game) => game.id === posId)) {
    console.error("ERROR: Invalid position id:", posId);
    response.status = 404;
    response.body = { error: "Invalid position id" };
    return;
  }

  if (solvedIds.has(posId)) {
    console.error("ERROR: Position already solved:", posId);
    response.status = 400;
    response.body = { error: "Position already solved" };
    return;
  }

  // Add to solved positions
  solvedIds.add(posId);

  // Persist to file
  try {
    // Create directory if it doesn't exist
    const dirPath = path.dirname(SOLVED_FILE);
    await fs.ensureDir(dirPath);

    // Write to file
    await Deno.writeTextFile(
      SOLVED_FILE,
      JSON.stringify(Array.from(solvedIds), null, 2)
    );

    response.body = { success: true, message: "Position marked as solved" };
  } catch (error) {
    console.error("ERROR: saving solved positions:", error);
    response.status = 500;
    response.body = { error: "Failed to save solved position" };
  }
});

// Serve static files from the dist directory
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/dist`,
      index: "index.html",
    });
  } catch {
    await next();
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("INFO: server listening on http://localhost:", PORT);
app.listen({ port: Number(PORT) });
