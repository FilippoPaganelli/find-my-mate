import { initUI } from "./ui.ts";
import {
  loadNewPosition,
  checkSolution,
  markAsSolved,
} from "./gameController.ts";

// Declare the class if TypeScript doesn't recognize it
declare class Chessboard {
  constructor();
}
declare global {
  interface Window {
    myGlobalInstance: Chessboard;
  }
}

// Create and attach the instance
(window as any).chessboardjs = new Chessboard();

document.addEventListener("DOMContentLoaded", async () => {
  initUI(loadNewPosition, checkSolution, markAsSolved);

  // Load first position
  await loadNewPosition();
});
