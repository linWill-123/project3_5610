import { useState, useEffect } from "react";
import { highScoreApi } from "../../services/api";
import "./HighScoresPage.css";

export const HighScoresPage = () => {
  const [highScores, setHighScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadHighScores();
  }, [filter]);

  const loadHighScores = async () => {
    try {
      setLoading(true);
      const difficulty = filter === 'ALL' ? null : filter;
      const data = await highScoreApi.getAllHighScores(difficulty, 100);
      setHighScores(data);
      setError(null);
    } catch (err) {
      console.error('Error loading high scores:', err);
      setError('Failed to load high scores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">High Scores</h1>
      <p className="page-subtitle">Best times for completed games</p>

      <div className="filter-tabs" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Games
        </button>
        <button 
          className={`tab-btn ${filter === 'EASY' ? 'active' : ''}`}
          onClick={() => setFilter('EASY')}
        >
          Easy
        </button>
        <button 
          className={`tab-btn ${filter === 'NORMAL' ? 'active' : ''}`}
          onClick={() => setFilter('NORMAL')}
        >
          Normal
        </button>
      </div>

      {loading && <div className="loading-message">Loading high scores...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="leaderboard-section">
        <div className="leaderboard">
          {!loading && !error && highScores.length === 0 && (
            <div className="no-scores-message" style={{ textAlign: 'center', padding: '2rem' }}>
              No high scores yet. Complete a game to set a record!
            </div>
          )}
          {!loading && highScores.map((score, index) => (
            <div key={score._id} className="leaderboard-item">
              <div className="rank">
                <span className="rank-number">{index + 1}</span>
              </div>
              <svg
                className="player-icon"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM8.39747 15.5534C8.64413 15.2206 9.11385 15.1508 9.44661 15.3975C10.175 15.9373 11.0541 16.25 12 16.25C12.9459 16.25 13.825 15.9373 14.5534 15.3975C14.8862 15.1508 15.3559 15.2206 15.6025 15.5534C15.8492 15.8862 15.7794 16.3559 15.4466 16.6025C14.4742 17.3233 13.285 17.75 12 17.75C10.715 17.75 9.5258 17.3233 8.55339 16.6025C8.22062 16.3559 8.15082 15.8862 8.39747 15.5534ZM16 10.5C16 11.3284 15.5523 12 15 12C14.4477 12 14 11.3284 14 10.5C14 9.67157 14.4477 9 15 9C15.5523 9 16 9.67157 16 10.5ZM9 12C9.55228 12 10 11.3284 10 10.5C10 9.67157 9.55228 9 9 9C8.44772 9 8 9.67157 8 10.5C8 11.3284 8.44772 12 9 12Z"
                  fill="#1C274C"
                />
              </svg>
              <div className="player-info">
                <span className="username">{score.username}</span>
                <span className="stats">
                  {score.gameId?.name || 'Unknown Game'} • {score.difficulty} • {formatTime(score.time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
