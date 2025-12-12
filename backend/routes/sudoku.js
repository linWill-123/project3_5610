const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const UserGameProgress = require('../models/UserGameProgress');
const HighScore = require('../models/HighScore');
const { hardSudoku, easySudoku } = require('../utils/sudokuGenerator');

// GET /api/sudoku - Get all games with completion counts
router.get('/', async (req, res) => {
  try {
    const games = await Game.find()
      .select('_id name difficulty createdBy createdAt')
      .sort({ createdAt: -1 });
    
    // Get completion counts for each game
    const gamesWithCounts = await Promise.all(games.map(async (game) => {
      const completionCount = await UserGameProgress.countDocuments({ 
        gameId: game._id, 
        isCompleted: true 
      });
      
      return {
        ...game.toObject(),
        completionCount
      };
    }));
    
    res.json(gamesWithCounts);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// GET /api/sudoku/:gameId - Get specific game with user progress
router.get('/:gameId', async (req, res) => {
  try {
    const { userId } = req.query; // Pass userId as query parameter
    
    const game = await Game.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Get user's progress for this game if userId provided
    let userProgress = null;
    if (userId) {
      userProgress = await UserGameProgress.findOne({ 
        userId, 
        gameId: req.params.gameId 
      });
    }
    
    // Get total completion count
    const completionCount = await UserGameProgress.countDocuments({ 
      gameId: req.params.gameId, 
      isCompleted: true 
    });
    
    const response = {
      ...game.toObject(),
      completionCount,
      userCompleted: userProgress?.isCompleted || false,
      userCompletionTime: userProgress?.completionTime || null,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// POST /api/sudoku - Create new game
router.post('/', async (req, res) => {
  try {
    const { difficulty, username, name } = req.body;
    
    if (!difficulty || !['EASY', 'NORMAL'].includes(difficulty.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid difficulty. Must be EASY or NORMAL' });
    }

    // generate game board
    let gameData;
    if (difficulty.toUpperCase() === 'EASY') {
      gameData = easySudoku();
    } else {
      gameData = hardSudoku();
    }

    // use provided name or generate a unique one
    let gameName;
    gameName = name.trim();

    // check if name already exists
    const existingGame = await Game.findOne({ name: gameName });

    if (existingGame) {
        return res.status(400).json({ error: 'A game with this name already exists. Please choose a different name.' });
    }

    // create new game
    const newGame = new Game({
      name: gameName,
      difficulty: difficulty.toUpperCase(),
      board: gameData.board,
      solution: gameData.solution,
      createdBy: username || 'Guest',
    });

    await newGame.save();
    
    res.status(201).json({
      gameId: newGame._id,
      name: newGame.name,
      difficulty: newGame.difficulty,
      createdBy: newGame.createdBy,
      createdAt: newGame.createdAt,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// POST /api/sudoku/:gameId/complete - Mark game as completed for a user
router.post('/:gameId/complete', async (req, res) => {
  try {
    const { userId, completionTime } = req.body;
    const { gameId } = req.params;
    
    if (!userId || completionTime === undefined) {
      return res.status(400).json({ error: 'userId and completionTime are required' });
    }

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Create or update user progress
    const progress = await UserGameProgress.findOneAndUpdate(
      { userId, gameId },
      {
        isCompleted: true,
        completionTime,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Game completion recorded',
      progress,
    });
  } catch (error) {
    console.error('Error recording completion:', error);
    res.status(500).json({ error: 'Failed to record completion' });
  }
});

// PUT /api/sudoku/:gameId - Update game
router.put('/:gameId', async (req, res) => {
  try {
    const { board } = req.body;
    
    const game = await Game.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // update fields
    if (board) game.board = board;

    await game.save();
    
    res.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// DELETE /api/sudoku/:gameId - Delete game
router.delete('/:gameId', async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Also delete associated user progress and high scores
    await UserGameProgress.deleteMany({ gameId: req.params.gameId });
    await HighScore.deleteMany({ gameId: req.params.gameId });
    
    res.json({ message: 'Game deleted successfully', gameId: req.params.gameId });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

module.exports = router;
