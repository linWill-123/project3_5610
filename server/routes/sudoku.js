const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { hardSudoku, easySudoku } = require('../utils/sudokuGenerator');

// GET /api/sudoku - Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find()
      .select('_id name difficulty createdBy createdAt')
      .sort({ createdAt: -1 });
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// GET /api/sudoku/:gameId - Get specific game
router.get('/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
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

// PUT /api/sudoku/:gameId - Update game
router.put('/:gameId', async (req, res) => {
  try {
    const { board, isCompleted, completionTime } = req.body;
    
    const game = await Game.findById(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // update fields
    if (board) game.board = board;
    if (isCompleted !== undefined) game.isCompleted = isCompleted;
    if (completionTime !== undefined) game.completionTime = completionTime;

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
    
    res.json({ message: 'Game deleted successfully', gameId: req.params.gameId });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

module.exports = router;
