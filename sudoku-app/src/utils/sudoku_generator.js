// put your name here
const name = "Shaokai Lin";

console.log("Project for " + name);

// Create an empty NxN board of nulls
function makeEmptyBoard(size) {
  const board = [];
  for (let r = 0; r < size; r++) {
    const row = new Array(size).fill(null);
    board.push(row);
  }
  return board;
}

// Check if placing val at (row, col) is valid
function isSafe(board, row, col, val, subH, subW) {
  const size = board.length;

  // row check
  for (let c = 0; c < size; c++) {
    if (board[row][c] === val) return false;
  }

  // col check
  for (let r = 0; r < size; r++) {
    if (board[r][col] === val) return false;
  }

  // subgrid check
  const startRow = Math.floor(row / subH) * subH;
  const startCol = Math.floor(col / subW) * subW;

  // iterate through subgrid
  for (let r = 0; r < subH; r++) {
    for (let c = 0; c < subW; c++) {
      // if found, not safe
      if (board[startRow + r][startCol + c] === val) return false;
    }
  }

  return true;
}

// Helper to generate a random array of numbers from 1 to size
function generateRandomNums(size) {
  const pool = [];
  for (let i = 1; i <= size; i++) {
    pool.push(i);
  }

  const nums = [];
  while (pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    nums.push(pool.splice(idx, 1)[0]);
  }

  return nums;
}

// Use backtracking dfs to fill the whole board with a valid completed Sudoku
// Works for 9x9, and 6x6
function fillBoard(board, subH, subW) {
  const size = board.length;

  function helper(cellIndex) {
    // If the current cell index is beyond the last cell, we're done
    if (cellIndex === size * size) {
      return true;
    }

    const row = Math.floor(cellIndex / size);
    const col = cellIndex % size;

    if (board[row][col] !== null) {
      // already filled (not needed in our case but nice to keep generic)
      return helper(cellIndex + 1);
    }

    // Obtain list of random nums and try numbers in random order so each run looks different
    const nums = generateRandomNums(size);
    for (let num of nums) {
      if (isSafe(board, row, col, num, subH, subW)) {
        board[row][col] = num;
        if (helper(cellIndex + 1)) {
          return true;
        }
        board[row][col] = null; // undo and try next
      }
    }

    // no number fits here
    return false;
  }

  helper(0);
  return board;
}

// Remove cells randomly until targetFilled amount remain
function carveHoles(board, targetFilled) {
  const size = board.length;
  const totalCells = size * size;
  const toRemove = totalCells - targetFilled;

  let removed = 0;
  while (removed < toRemove) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    // Only remove if cell is not already null
    if (board[row][col] !== null) {
      board[row][col] = null;
      removed++;
    }
  }

  return board;
}

// Pretty print board with subgrid dividers
function printBoard(
  board,
  subH,
  subW,
  horizontalLine = "————————————————————————————————"
) {
  const size = board.length;

  for (let r = 0; r < size; r++) {
    let row = "";
    for (let c = 0; c < size; c++) {
      // Add cell value or underscore for empty
      if (board[r][c] === null) {
        row += "_";
      } else {
        row += board[r][c];
      }

      // Add spacing
      row += "  ";

      // Add vertical line
      if ((c + 1) % subW === 0 && c < size - 1) {
        row += "|  ";
      }
    }
    console.log(row);

    // Add horizontal line between subgrid rows
    if ((r + 1) % subH === 0 && r < size - 1) {
      console.log(horizontalLine);
    }
  }

  console.log();
}
// ---------------------- CORE BUILDER ---------------------- //

// This function builds either hard (9x9) or easy (6x6)
function commonSudokuBuilder({ size, subH, subW, targetFilledCells }) {
  // First make empty board
  let board = makeEmptyBoard(size);

  // Fill it with a valid full Sudoku board
  board = fillBoard(board, subH, subW);

  // Carve holes to match difficulty
  board = carveHoles(board, targetFilledCells);

  return board;
}

// ---------------------- REQUIRED FUNCTIONS ---------------------- //

function hardSudoku() {
  // insert code here for your sudoku board generator.  It should construct a
  // 9X9 game board with only 28 cells available at the start.  You should then
  // pretty print the output with lines indicating where each sub square ends, like this:

  // Based on assignment requirement we need 28-30 cells
  const filledCellsOptions = [28, 29, 30];
  const targetFilled =
    filledCellsOptions[Math.floor(Math.random() * filledCellsOptions.length)];

  const board = commonSudokuBuilder({
    size: 9,
    subH: 3,
    subW: 3,
    targetFilledCells: targetFilled,
  });

  return board;
}

function easySudoku() {
  // same for an easy sudoku.  Should be a 6X6 board with half of the cells filled in.  Please also pretty print
  const targetFilled = 18;

  const board = commonSudokuBuilder({
    size: 6,
    subH: 2,
    subW: 3,
    targetFilledCells: targetFilled,
  });

  return board;
}

// TO TEST
// we are running each function 3 times to determine that the outputs are unique
console.log("Testing code...");
console.log("EASY SUDOKU:");
easySudoku();
easySudoku();
easySudoku();

console.log("HARD SUDOKU:");
hardSudoku();
hardSudoku();
hardSudoku();
