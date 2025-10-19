const API_BASE = "/connect4api";

async function fetchJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return await res.json();
}

const boardElement = document.getElementById("board");
const playerSelect = document.getElementById("player-select");
const newGameBtn = document.getElementById("new-game");
const statusText = document.getElementById("status-text");
const colButtons = document.querySelectorAll(".col-btn");

// Draw the current game board
async function drawBoard() {
  const gameData = await fetchJSON("/gameboard");
  const board = gameData.board;
  boardElement.innerHTML = "";

  board.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.style.backgroundColor =
        cell === 1 ? "red" : cell === 2 ? "yellow" : "white";
      tr.appendChild(td);
    });
    boardElement.appendChild(tr);
  });

  updateStatus();
}

// Display current player / winner / draw
async function updateStatus() {
  const state = await fetchJSON("/state");
  const { turn, active, winner } = state;

  if (!active) {
    if (winner === 0) {
      statusText.textContent = "It's a draw!";
    } else {
      statusText.textContent = `🎉 Player ${winner} wins!`;
      statusText.style.fontSize = '40px';
    }
    disableColumnButtons();
    return;
  }

  const currentPlayer = turn % 2 === 1 ? 1 : 2;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
  enableColumnButtons();
}

// Called when player clicks a column button
async function placeToken(col) {
  const state = await fetchJSON("/state");
  const currentPlayer = state.turn % 2 === 1 ? 1 : 2;
  const selectedView = parseInt(playerSelect.value);

  if (selectedView !== currentPlayer) {
    alert("It's not your turn!");
    return;
  }

  await fetchJSON(`/droptoken?column=${col}`);
  drawBoard();
}

// Enable and disable buttons for game state
function disableColumnButtons() {
  colButtons.forEach((btn) => (btn.disabled = true));
}

function enableColumnButtons() {
  colButtons.forEach((btn) => (btn.disabled = false));
}

// This function will run once the HTML page is fully loaded.
function initializeGame() {
  drawBoard();
}

// --- Event Listeners & Initial Setup ---

// Add click listeners to all the column buttons
colButtons.forEach((btn) => {
  const col = parseInt(btn.dataset.col);
  btn.addEventListener("click", () => placeToken(col));
});

// Add a click listener for the "Start New Game" button
newGameBtn.addEventListener("click", async () => {
  await fetchJSON("/startgame");
  drawBoard();
});

// Set the game to auto-refresh every 1.5 seconds. This allows two players
// on different computers to see each other's moves.
setInterval(drawBoard, 1500);

// Run the initial setup function as soon as the HTML document is ready.
document.addEventListener("DOMContentLoaded", initializeGame);