import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectionPage.css";
import { sudokuApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const SelectionPage = () => {
  const [activeTab, setActiveTab] = useState("All Games");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [gameName, setGameName] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await sudokuApi.getAllGames();
      setGames(data);
      setError(null);
    } catch (err) {
      console.error('Error loading games:', err);
      setError('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGameClick = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setGameName('');
    setShowNameModal(true);
  };

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      alert('Please enter a game name');
      return;
    }

    try {
      const username = user?.username || 'Guest';
      console.log('Creating game with user:', user, 'username:', username);
      const result = await sudokuApi.createGame(selectedDifficulty, username, gameName.trim());
      setShowNameModal(false);
      navigate(`/game/${result.gameId}`);
    } catch (err) {
      console.error('Error creating game:', err);
      // Check if it's a duplicate name error
      if (err.message.includes('already exists')) {
        alert('A game with this name already exists. Please choose a different name.');
      } else {
        alert('Failed to create game. Please try again.');
      }
    }
  };

  const handleModalClose = () => {
    setShowNameModal(false);
    setGameName('');
    setSelectedDifficulty(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filterGames = (games) => {
    if (activeTab === "All Games") return games;
    if (activeTab === "Easy") return games.filter(g => g.difficulty === "EASY");
    if (activeTab === "Normal" || activeTab === "Medium") return games.filter(g => g.difficulty === "NORMAL");
    return games;
  };

  const tabs = ["All Games", "Easy", "Normal"];

  const filteredGames = filterGames(games);

  return (
    <div className="page-container">
      <h1 className="page-title">Sudoku Games</h1>
      <p className="page-subtitle">Create a new game or select from existing games</p>

      <div className="create-game-buttons" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className="difficulty-btn easy-btn" 
          onClick={() => handleCreateGameClick('EASY')}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', border: 'none' }}
        >
          Create Easy Game
        </button>
        <button 
          className="difficulty-btn medium-btn" 
          onClick={() => handleCreateGameClick('NORMAL')}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', border: 'none' }}
        >
          Create Normal Game
        </button>
      </div>

      {/* Name Input Modal */}
      {showNameModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Name Your Game</h2>
            <p>Enter a name for your {selectedDifficulty?.toLowerCase()} game:</p>
            <input
              type="text"
              className="game-name-input"
              placeholder="e.g., My First Sudoku"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
              autoFocus
              maxLength={50}
            />
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="modal-btn create-btn" onClick={handleCreateGame}>
                Create Game
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="game-selector">
        <div className="selector-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading-message">Loading games...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="games-list">
        {!loading && !error && filteredGames.length === 0 && (
          <div className="no-games-message">
            No games found. Create a new game to get started!
          </div>
        )}
        {!loading && filteredGames.map((game) => (
          <div key={game._id} className="game-item">
            <div className="game-date">
              <span className="date-text">{formatDate(game.createdAt)}</span>
              <span className={`difficulty-tag ${game.difficulty === 'EASY' ? 'easy-btn' : 'medium-btn'}`}>
                {game.difficulty}
              </span>
            </div>
            <div className="game-info">
              <h3 className="game-title">{game.name}</h3>
              <p className="game-author">Created by {game.createdBy}</p>
              <div className="game-stats">
                <span className="stat">
                  {game.difficulty === 'EASY' ? '6×6 Grid' : '9×9 Grid'}
                </span>
                {game.completionCount > 0 && (
                  <span className="stat completion-count" style={{ color: '#3498db', fontWeight: '500' }}>
                    • {game.completionCount} completion{game.completionCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <button 
              className="play-btn"
              onClick={() => navigate(`/game/${game._id}`)}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
