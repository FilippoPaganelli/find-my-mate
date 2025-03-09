import { Color } from "../chessjs/chess.ts";

/**
 * Initializes UI event handlers
 * @param {Function} onNewPosition - Handler for new position button
 * @param {Function} onCheck - Handler for check solution button
 * @param {Function} onSolve - Handler for solve button
 */
export function initUI(
  onNewPosition: () => void,
  onCheck: () => void,
  onSolve: () => void
) {
  // Add event listeners to the buttons that already exist in the HTML
  const newButton = document.getElementById("new-button");
  if (newButton) {
    newButton.addEventListener("click", onNewPosition);
  }
  const checkButton = document.getElementById("check-button");
  if (checkButton) {
    checkButton.addEventListener("click", onCheck);
  }
  const solveButton = document.getElementById("solve-button");
  if (solveButton) {
    solveButton.addEventListener("click", onSolve);
  }
  declare const chessboardjs = new (globalThis as any).Chessboard();

  console.log("UI initialized");
}

/**
 * Updates the UI to show game status
 * @param {string} message - Status message
 * @param {boolean} isCorrect - Whether the solution is correct
 */
export function updateStatusDisplay(
  message: string,
  isCorrect: boolean = false
) {
  const statusElement = document.getElementById("status");
  if (statusElement) {
    statusElement.textContent = message;

    // Update status color based on correctness
    if (isCorrect === true) {
      statusElement.className = "text-xl font-bold my-4 h-8 text-green-600";
      document.getElementById("solve-button")?.classList.remove("hidden");
    } else if (isCorrect === false) {
      statusElement.className = "text-xl font-bold my-4 h-8 text-red-600";
    } else {
      statusElement.className = "text-xl font-bold my-4 h-8";
    }
  }
}

/**
 * Updates the position information display
 * @param {string} id - Position ID
 * @param {string} moveColor - Color to move ('w' or 'b')
 * @param {string} hint - Optional hint text
 */
export function updatePositionInfo(id: string, moveColor: Color, hint = "") {
  const positionInfo = document.getElementById("position-info");
  if (positionInfo) {
    positionInfo.textContent = `Position ID: ${id} - ${
      moveColor === "w" ? "White" : "Black"
    } to move`;
  }

  const hintElement = document.getElementById("hint");
  if (hintElement) {
    if (hint) {
      hintElement.textContent = hint;
      hintElement.classList.remove("hidden");
    } else {
      hintElement.classList.add("hidden");
    }
  }
}

/**
 * Resets the UI for a new position
 */
export function resetUI() {
  document.getElementById("check-button")?.classList.remove("hidden");
  document.getElementById("solve-button")?.classList.add("hidden");
  const status = document.getElementById("status");
  if (status) {
    status.textContent = "";
    status.className = "text-xl font-bold my-4 h-8";
  }
  const attempts = document.getElementById("attempts");
  if (attempts) {
    attempts.textContent = "Attempts: 0";
  }
}

/**
 * Updates the attempt counter
 * @param {number} count - Number of attempts
 */
export function updateAttemptCounter(count: number) {
  const attemps = document.getElementById("attempts");
  if (attemps) {
    attemps.textContent = `Attempts: ${count}`;
  }
}

/**
 * Shows an error message
 * @param {string} message - The error message to display
 */
export function showError(message: string) {
  updateStatusDisplay(message, false);
}
