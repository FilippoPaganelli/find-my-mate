import { initUI } from "./ui.ts";
import {
  loadNewPosition,
  checkSolution,
  markAsSolved,
} from "./gameController.js";

document.addEventListener("DOMContentLoaded", async () => {
  initUI(loadNewPosition, checkSolution, markAsSolved);

  // Load first position
  await loadNewPosition();
});
