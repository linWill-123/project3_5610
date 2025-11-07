import { SudokuProvider } from "../../context/SudokuContext";
import SudokuGame from "../../components/SudokuGame";

export const EasyGamePage = () => {
  return (
    <SudokuProvider>
      <SudokuGame mode="easy" title="Sudoku" difficulty="Easy" />
    </SudokuProvider>
  );
};
