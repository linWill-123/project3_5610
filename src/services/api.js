// API service for backend communication

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Sudoku API calls
export const sudokuApi = {
  getAllGames: async () => {
    const response = await fetch(`${API_BASE_URL}/sudoku`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return response.json();
  },

  getGame: async (gameId, userId = null) => {
    const url = userId 
      ? `${API_BASE_URL}/sudoku/${gameId}?userId=${userId}`
      : `${API_BASE_URL}/sudoku/${gameId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch game');
    return response.json();
  },

  createGame: async (difficulty, username = 'Guest', name = null) => {
    const response = await fetch(`${API_BASE_URL}/sudoku`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ difficulty, username, name }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create game');
    }
    return response.json();
  },

  updateGame: async (gameId, data) => {
    const response = await fetch(`${API_BASE_URL}/sudoku/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update game');
    return response.json();
  },

  deleteGame: async (gameId) => {
    const response = await fetch(`${API_BASE_URL}/sudoku/${gameId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete game');
    return response.json();
  },

  completeGame: async (gameId, userId, completionTime) => {
    const response = await fetch(`${API_BASE_URL}/sudoku/${gameId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, completionTime }),
    });
    if (!response.ok) throw new Error('Failed to record game completion');
    return response.json();
  },
};

export const highScoreApi = {
  getAllHighScores: async (difficulty = null, limit = 50) => {
    let url = `${API_BASE_URL}/highscore?limit=${limit}`;
    if (difficulty) {
      url += `&difficulty=${difficulty}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch high scores');
    return response.json();
  },

  getGameHighScore: async (gameId) => {
    const response = await fetch(`${API_BASE_URL}/highscore/${gameId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch high score');
    }
    return response.json();
  },

  submitHighScore: async (gameId, username, time) => {
    const response = await fetch(`${API_BASE_URL}/highscore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, username, time }),
    });
    if (!response.ok) throw new Error('Failed to submit high score');
    return response.json();
  },

  getGamesByCompletion: async (difficulty = null) => {
    const url = difficulty 
      ? `${API_BASE_URL}/highscore/games/by-completion?difficulty=${difficulty}`
      : `${API_BASE_URL}/highscore/games/by-completion`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch game statistics');
    return response.json();
  },
};

export const authApi = {
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register');
    }
    return response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to login');
    }
    return response.json();
  },

  getCurrentUser: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    return response.json();
  },
};
