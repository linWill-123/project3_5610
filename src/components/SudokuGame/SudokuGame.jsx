import { useEffect } from "react";
import { useSudoku } from "../../context/SudokuContext";
import SudokuCell from "../SudokuCell/SudokuCell";
import { easySudoku, hardSudoku } from "../../utils/sudoku_generator";
import "./SudokuGame.css";
import GameControls from "../GameControls/GameControls";
import { sudokuApi, highScoreApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SudokuGame = ({ 
  mode, 
  title, 
  difficulty, 
  gameId = null, 
  initialBoard = null, 
  solution = null,
  userCompleted = false,
  userCompletionTime = null,
  completionCount = 0,
}) => {
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

  const { user } = useAuth();

  // initialize the game when component mounts or mode changes
  useEffect(() => {
    if (gameId && initialBoard && solution) {
      // Load existing game from database
      loadExistingGame();
    } else {
      // Generate new game (for quick play)
      generateNewGame();
    }
  }, [mode, gameId]);

  // Handle game completion - update database and submit high score
  useEffect(() => {
    if (gameWon && gameId && !userCompleted && board) {
      handleGameCompletion();
    }
  }, [gameWon, gameId, board]);

  const handleGameCompletion = async () => {
    if (!board) return;
    
    try {
      const userId = user?.username || 'Guest';
      
      // Record user's completion
      await sudokuApi.completeGame(gameId, userId, timer);
      
      // Submit high score
      const result = await highScoreApi.submitHighScore(gameId, userId, timer);
      
      if (result.isNewRecord) {
        console.log('New high score!', result);
      }
    } catch (err) {
      console.error('Error saving game completion:', err);
    }
  };

  const loadExistingGame = () => {
    if (!initialBoard || !Array.isArray(initialBoard)) {
      console.error('Invalid initialBoard:', initialBoard);
      return;
    }

    let gameSize, subH, subW;

    if (mode === "easy") {
      gameSize = 6;
      subH = 2;
      subW = 3;
    } else {
      gameSize = 9;
      subH = 3;
      subW = 3;
    }

    // Use initialBoard as the original board (starting state)
    const newOriginalBoard = initialBoard.map((row) => [...row]);
    
    // If user has completed this game, show the solution
    let currentBoard;
    if (userCompleted && solution && Array.isArray(solution)) {
      currentBoard = solution.map((row) => [...row]);
    } else {
      currentBoard = initialBoard.map((row) => [...row]);
    }

    setBoard(currentBoard, newOriginalBoard, gameSize, subH, subW);
  };

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
    // Only allow new game if it's a quick play (no gameId)
    if (!gameId) {
      generateNewGame();
    }
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

      {userCompleted && !gameWon && (
        <div className="completed-notice" style={{ 
          background: '#e8f4f8', 
          padding: '1rem', 
          marginBottom: '1rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          You previously completed this game in {formatTime(userCompletionTime || 0)}. 
          {completionCount > 1 && ` This puzzle has been completed by ${completionCount} player${completionCount > 1 ? 's' : ''}.`}
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            The solution is displayed below.
          </div>
        </div>
      )}

      {isPaused && !gameWon && !userCompleted && (
        <div className="pause-overlay">
          <div className="pause-message">Game Paused</div>
          <button className="resume-btn" onClick={handlePause}>
            Resume Game
          </button>
        </div>
      )}

      {!isPaused && !gameWon && !userCompleted && (
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
          <GameControls 
            onNewGame={gameId ? null : handleNewGame} 
            onReset={handleReset} 
          />
        </div>
      )}

      {userCompleted && (
        <div>
          <div className="game-board">
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
        </div>
      )}
    </div>
  );
};

export default SudokuGame;
