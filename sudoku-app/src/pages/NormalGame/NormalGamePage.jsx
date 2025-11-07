import { SudokuProvider } from "../../context/SudokuContext";
import SudokuGame from "../../components/SuokuGame/SudokuGame";

export const NormalGamePage = () => {
  return (
    <SudokuProvider>
      <SudokuGame mode="normal" title="Sudoku" difficulty="Normal" />
    </SudokuProvider>
  );
};
