import React, { createContext, useContext, useReducer, useEffect } from "react";
import { isSafe } from "../utils/sudoku_generator";

const SudokuContext = createContext();

const ACTIONS = {
  SET_BOARD: "SET_BOARD",
  SET_CELL: "SET_CELL",
  SET_SELECTED: "SET_SELECTED",
  SET_GAME_MODE: "SET_GAME_MODE",
  SET_TIMER: "SET_TIMER",
  SET_PAUSED: "SET_PAUSED",
  RESET_GAME: "RESET_GAME",
  NEW_GAME: "NEW_GAME",
  SET_GAME_WON: "SET_GAME_WON",
  SET_VALIDATION_ERRORS: "SET_VALIDATION_ERRORS",
};

const initialState = {
  board: null,
  originalBoard: null,
  selectedCell: null,
  gameMode: null,
  timer: 0,
  isPaused: false,
  gameWon: false,
  validationErrors: new Set(),
  size: 6,
  subH: 2,
  subW: 3,
};

function sudokuReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_BOARD:
      return {
        ...state,
        board: action.payload.board,
        originalBoard: action.payload.originalBoard,
        size: action.payload.size,
        subH: action.payload.subH,
        subW: action.payload.subW,
        gameWon: false,
        validationErrors: new Set(),
        timer: 0,
      };

    case ACTIONS.SET_CELL:
      const newBoard = state.board.map((row) => [...row]);
      const { row, col, value } = action.payload;
      newBoard[row][col] = value === "" ? null : parseInt(value);

      return {
        ...state,
        board: newBoard,
      };

    case ACTIONS.SET_SELECTED:
      return {
        ...state,
        selectedCell: action.payload,
      };

    case ACTIONS.SET_GAME_MODE:
      return {
        ...state,
        gameMode: action.payload,
      };

    case ACTIONS.SET_TIMER:
      return {
        ...state,
        timer: action.payload,
      };

    case ACTIONS.SET_PAUSED:
      return {
        ...state,
        isPaused: action.payload,
      };

    case ACTIONS.RESET_GAME:
      return {
        ...state,
        board: state.originalBoard.map((row) => [...row]),
        timer: 0,
        gameWon: false,
        validationErrors: new Set(),
        selectedCell: null,
      };

    case ACTIONS.NEW_GAME:
      return {
        ...state,
        board: action.payload.board,
        originalBoard: action.payload.originalBoard,
        timer: 0,
        gameWon: false,
        validationErrors: new Set(),
        selectedCell: null,
      };

    case ACTIONS.SET_GAME_WON:
      return {
        ...state,
        gameWon: action.payload,
        isPaused: action.payload,
      };

    case ACTIONS.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload,
      };

    default:
      return state;
  }
}

export function SudokuProvider({ children }) {
  const [state, dispatch] = useReducer(sudokuReducer, initialState);

  // Timer
  useEffect(() => {
    if (!state.isPaused && !state.gameWon && state.board) {
      const interval = setInterval(() => {
        dispatch({ type: ACTIONS.SET_TIMER, payload: state.timer + 1 });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.timer, state.isPaused, state.gameWon, state.board]);

  // check for game completion and validate board
  useEffect(() => {
    if (state.board && !state.gameWon) {
      validateBoard();
      checkGameCompletion();
    }
  }, [state.board]);

  const setBoard = (board, originalBoard, size, subH, subW) => {
    dispatch({
      type: ACTIONS.SET_BOARD,
      payload: { board, originalBoard, size, subH, subW },
    });
  };

  const setCell = (row, col, value) => {
    // Only allow changes to non-original cells
    if (state.originalBoard && state.originalBoard[row][col] !== null) {
      return;
    }

    dispatch({
      type: ACTIONS.SET_CELL,
      payload: { row, col, value },
    });
  };

  const setSelected = (row, col) => {
    dispatch({
      type: ACTIONS.SET_SELECTED,
      payload: { row, col },
    });
  };

  const setGameMode = (mode) => {
    dispatch({
      type: ACTIONS.SET_GAME_MODE,
      payload: mode,
    });
  };

  const togglePause = () => {
    dispatch({
      type: ACTIONS.SET_PAUSED,
      payload: !state.isPaused,
    });
  };

  const resetGame = () => {
    dispatch({ type: ACTIONS.RESET_GAME });
  };

  const newGame = (board, originalBoard) => {
    dispatch({
      type: ACTIONS.NEW_GAME,
      payload: { board, originalBoard },
    });
  };

  const validateBoard = () => {
    if (!state.board) return;

    const errors = new Set();
    const { board, size, subH, subW } = state;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const value = board[row][col];
        if (value !== null) {
          // Temporarily remove the value to check if it's safe
          board[row][col] = null;
          if (!isSafe(board, row, col, value, subH, subW)) {
            errors.add(`${row}-${col}`);
          }
          board[row][col] = value;
        }
      }
    }

    dispatch({
      type: ACTIONS.SET_VALIDATION_ERRORS,
      payload: errors,
    });
  };

  const checkGameCompletion = () => {
    if (!state.board || state.gameWon) return;

    const { board, size } = state;

    // check if all cells are filled
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === null) {
          return;
        }
      }
    }

    // also check if there are no validation errors
    if (state.validationErrors.size === 0) {
      dispatch({
        type: ACTIONS.SET_GAME_WON,
        payload: true,
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isCellOriginal = (row, col) => {
    return state.originalBoard && state.originalBoard[row][col] !== null;
  };

  const isCellError = (row, col) => {
    return state.validationErrors.has(`${row}-${col}`);
  };

  const isCellSelected = (row, col) => {
    return (
      state.selectedCell &&
      state.selectedCell.row === row &&
      state.selectedCell.col === col
    );
  };

  const value = {
    ...state,
    setBoard,
    setCell,
    setSelected,
    setGameMode,
    togglePause,
    resetGame,
    newGame,
    formatTime,
    isCellOriginal,
    isCellError,
    isCellSelected,
    ACTIONS,
  };

  return (
    <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>
  );
}

export function useSudoku() {
  const context = useContext(SudokuContext);
  if (!context) {
    throw new Error("useSudoku must be used within a SudokuProvider");
  }
  return context;
}
