class Game {
  constructor() {
    this.rows = 6;
    this.cols = 7;
    this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    this.turn = 1;
    this.active = true;
    this.winner = 0;
  }

  // odd turn = player 1, even = player 2
  get currentPlayer() {
    return this.turn % 2 === 1 ? 1 : 2;
  }

  dropToken(column) {
    if (!this.active) return;

    const player = this.currentPlayer;
    // check for open cell from bottom row up
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row][column] === 0) {
        this.board[row][column] = player;
        break;
      }
    }

    if (this.checkWinner(player)) {
      this.winner = player;
      this.active = false;
    } else if (this.isBoardFull()) {
      this.active = false;
      this.winner = 0; // draw
    } else {
      this.turn++;
    }
  }

  isBoardFull() {
    return this.board.every(row => row.every(cell => cell !== 0));
  }

  checkWinner(player) {
    const gameBoard = this.board;
    const dirs = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    //loop through rows and columns
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // if the cell is not occupied, do not check
        if (gameBoard[row][col] !== player) continue;
        // check each direction 
        for (let [rowDirection, colDirection] of dirs) {
          // keep track of tokens in a row
          let count = 1;
          // check 4 tokens max in each direction
          for (let k = 1; k < 4; k++) {
            const nextRow = row + rowDirection * k;
            const nextCol = col + colDirection * k;
            // if we go off the board, end check
            if (nextRow < 0 || nextRow >= this.rows || nextCol < 0 || nextCol >= this.cols) break;
            // if the next token is a match, increment count
            if (gameBoard[nextRow][nextCol] === player) count++;
            else break;
          }
          // if there are 4 in a row, player wins
          if (count >= 4) return true;
        }
      }
    }
    return false;
  }
}

module.exports = { Game };
