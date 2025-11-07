import { useEffect } from "react";
import { useSudoku } from "../context/SudokuContext";
import SudokuCell from "./SudokuCell/SudokuCell";
import { easySudoku, hardSudoku } from "../utils/sudoku_generator";
import "./SudokuGame.css";

const SudokuGame = ({ mode, title, difficulty }) => {
  const {
    board,
    timer,
    isPaused,
    gameWon,
    setBoard,
    togglePause,
    resetGame,
    formatTime,
  } = useSudoku();

  // initialize the game when component mounts or mode changes
  useEffect(() => {
    generateNewGame();
  }, [mode]);

  const generateNewGame = () => {
    let newBoard, newOriginalBoard;
    let gameSize, subH, subW;

    if (mode === "easy") {
      newBoard = easySudoku();
      gameSize = 6;
      subH = 2;
      subW = 3;
    } else {
      newBoard = hardSudoku();
      gameSize = 9;
      subH = 3;
      subW = 3;
    }

    // create a deep copy for the original board
    newOriginalBoard = newBoard.map((row) => [...row]);

    // create another copy for the current board
    const currentBoard = newBoard.map((row) => [...row]);

    setBoard(currentBoard, newOriginalBoard, gameSize, subH, subW);
  };

  const handleNewGame = () => {
    generateNewGame();
  };

  const handleReset = () => {
    resetGame();
  };

  const handlePause = () => {
    togglePause();
  };

  if (!board) {
    return <div className="loading">Generating Sudoku...</div>;
  }

  const maxValue = mode === "easy" ? 6 : 9;
  const gridClass = mode === "easy" ? "sudoku-grid-6x6" : "sudoku-grid-9x9";
  const difficultyClass =
    mode === "easy"
      ? "easy-btn"
      : difficulty === "Hard"
      ? "hard-btn"
      : "medium-btn";

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-meta">
          <div>
            <h1>{title || "Sudoku"}</h1>
            <div className={`difficulty-badge ${difficultyClass}`}>
              {difficulty || (mode === "easy" ? "Easy" : "Normal")}
            </div>
          </div>
          <div className="timer-container">
            <div className="timer">{formatTime(timer)}</div>
            <button className="timer-btn" onClick={handlePause}>
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>
        <div className="game-date">
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {gameWon && (
        <div className="victory-message">
          Congratulations! You completed the puzzle in {formatTime(timer)}!
        </div>
      )}

      {isPaused && !gameWon && (
        <div className="pause-overlay">
          <div className="pause-message">Game Paused</div>
          <button className="resume-btn" onClick={handlePause}>
            Resume Game
          </button>
        </div>
      )}

      {!isPaused && !gameWon && (
        <div>
          <div
            className="game-board"
            style={{ opacity: isPaused && !gameWon ? 0.3 : 1 }}
          >
            <div className={gridClass}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <SudokuCell
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    value={cell}
                    maxValue={maxValue}
                  />
                ))
              )}
            </div>
          </div>
          <div className="game-controls">
            <div className="control-group">
              <button
                className="game-btn secondary"
                onClick={handleReset}
                disabled={isPaused}
              >
                Reset
              </button>
            </div>
            <div className="control-group">
              <button
                className="game-btn primary"
                onClick={handleNewGame}
                disabled={isPaused}
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SudokuGame;
