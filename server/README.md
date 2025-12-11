# Sudoku Backend Server

This is the backend server for the Sudoku application using Express.js and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. The MongoDB connection string is already configured in `.env`

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Sudoku Games

- **GET /api/sudoku** - Get all games
- **GET /api/sudoku/:gameId** - Get specific game
- **POST /api/sudoku** - Create new game
  - Body: `{ "difficulty": "EASY" | "NORMAL", "username": "Player Name" }`
- **PUT /api/sudoku/:gameId** - Update game
  - Body: `{ "board": [[...]], "isCompleted": true, "completionTime": 123 }`
- **DELETE /api/sudoku/:gameId** - Delete game

### High Scores

- **GET /api/highscore** - Get all high scores (sorted by time)
  - Query params: `?difficulty=EASY|NORMAL&limit=50`
- **GET /api/highscore/:gameId** - Get high score for specific game
- **POST /api/highscore** - Create/update high score
  - Body: `{ "gameId": "...", "username": "...", "time": 123 }`
