import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SudokuProvider } from "../../context/SudokuContext";
import SudokuGame from "../../components/SudokuGame/SudokuGame";
import { sudokuApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./GamePage.css";

export const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGame();
  }, [gameId, user]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const userId = user?.username || 'Guest';
      const data = await sudokuApi.getGame(gameId, userId);
      setGameData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">Loading game...</div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="page-container">
        <div className="error-message">{error || 'Game not found'}</div>
        <button 
          className="difficulty-btn medium-btn" 
          onClick={() => navigate('/games')}
          style={{ marginTop: '1rem' }}
        >
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <SudokuProvider>
      <SudokuGame 
        mode={gameData.difficulty.toLowerCase()} 
        title={gameData.name}
        difficulty={gameData.difficulty}
        gameId={gameId}
        initialBoard={gameData.board}
        solution={gameData.solution}
        userCompleted={gameData.userCompleted}
        userCompletionTime={gameData.userCompletionTime}
        completionCount={gameData.completionCount}
      />
    </SudokuProvider>
  );
};
