import { setupChallenge, getCurrentFen, isCheckmate } from "./board.js";
import {
  updatePositionInfo,
  resetUI,
  showError,
  updateStatusDisplay,
  updateAttemptCounter,
} from "./ui.ts";

// State variables
let currentChallengeId: string | null = null;
let attemptCount = 0;

/**
 * Load a new chess challenge position from the server
 */
export async function loadNewPosition() {
  try {
    const response = await fetch("/api/position");
    if (!response.ok) {
      throw new Error("Failed to fetch position");
    }

    const challenge = await response.json();
    currentChallengeId = challenge.id;

    // Update the UI with position data
    updatePositionInfo(challenge.id, challenge.moveColor, challenge.hint);

    // Set up the board with the challenge
    setupChallenge(
      challenge.challengeFen,
      challenge.removedPieces,
      challenge.id
    );

    // Reset UI elements for a new game
    resetUI();

    // Reset attempt counter
    attemptCount = 0;
    updateAttemptCounter(attemptCount);
  } catch (error) {
    console.error("Error loading position:", error);
    showError("Error loading position");
  }
}

/**
 * Check if the current solution is correct
 */
export async function checkSolution() {
  if (!currentChallengeId) return;

  try {
    // Increment attempt counter
    attemptCount++;
    updateAttemptCounter(attemptCount);

    // Check if the current position is checkmate before sending to server
    if (!isCheckmate()) {
      updateStatusDisplay("This position is not checkmate. Try again!", false);
      return;
    }

    const response = await fetch("/api/check-solution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        posId: currentChallengeId,
        proposedFen: getCurrentFen(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to check solution");
    }

    const result = await response.json();
    updateStatusDisplay(result.message, result.correct);

    if (result.correct) {
      document.getElementById("check-button")?.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error checking solution:", error);
    showError("Error checking your solution");
  }
}

/**
 * Mark the current position as solved
 */
export async function markAsSolved() {
  if (!currentChallengeId) return;

  try {
    const response = await fetch("/api/solved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posId: currentChallengeId }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark position as solved");
    }

    // Load a new position
    await loadNewPosition();
    updateStatusDisplay("Great! Position marked as solved. Try a new one!");
  } catch (error) {
    console.error("Error marking position as solved:", error);
    showError("Error saving your progress");
  }
}
