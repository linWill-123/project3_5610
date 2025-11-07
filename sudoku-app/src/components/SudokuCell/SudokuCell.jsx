import { useSudoku } from "../../context/SudokuContext";
import "./SudokuCell.css";

const SudokuCell = ({ row, col, value, maxValue }) => {
  const {
    setCell,
    setSelected,
    isCellOriginal,
    isCellError,
    isCellSelected,
    gameWon,
  } = useSudoku();

  const handleClick = () => {
    if (!gameWon && !isCellOriginal(row, col)) {
      setSelected(row, col);
    }
  };

  const handleChange = (e) => {
    if (gameWon || isCellOriginal(row, col)) return;

    const inputValue = e.target.value;

    if (
      inputValue === "" ||
      (inputValue >= 1 && inputValue <= maxValue && !isNaN(inputValue))
    ) {
      setCell(row, col, inputValue);
    }
  };

  const handleKeyDown = (e) => {
    const allowedKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Backspace",
      "Delete",
    ];

    if (allowedKeys.includes(e.key)) return;

    // allow numbers between 1 and maxValue
    if (e.key >= "1" && e.key <= maxValue.toString()) return;

    // prevent all other keys
    e.preventDefault();
  };

  const getCellClasses = () => {
    let classes = "sudoku-cell";

    if (isCellOriginal(row, col)) {
      classes += " given";
    }

    if (isCellSelected(row, col)) {
      classes += " selected";
    }

    if (isCellError(row, col)) {
      classes += " invalid";
    }

    if (gameWon) {
      classes += " game-won";
    }

    return classes;
  };

  return (
    <input
      type="text"
      className={getCellClasses()}
      value={value || ""}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      readOnly={isCellOriginal(row, col) || gameWon}
      maxLength="1"
      inputMode="numeric"
    />
  );
};

export default SudokuCell;
