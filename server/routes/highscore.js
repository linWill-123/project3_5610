const express = require('express');
const router = express.Router();
const HighScore = require('../models/HighScore');
const Game = require('../models/Game');

// GET /api/highscore - Get all high scores (sorted)
router.get('/', async (req, res) => {
  try {
    const { difficulty, limit = 50 } = req.query;
    
    let query = {};
    if (difficulty && ['EASY', 'NORMAL'].includes(difficulty.toUpperCase())) {
      query.difficulty = difficulty.toUpperCase();
    }

    const highScores = await HighScore.find(query)
      .populate('gameId', 'name difficulty')
      .sort({ time: 1 }) // sort by time ascending (fastest first)
      .limit(parseInt(limit));
    
    res.json(highScores);
  } catch (error) {
    console.error('Error fetching high scores:', error);
    res.status(500).json({ error: 'Failed to fetch high scores' });
  }
});

// GET /api/highscore/:gameId - Get high score for specific game
router.get('/:gameId', async (req, res) => {
  try {
    const highScore = await HighScore.findOne({ gameId: req.params.gameId })
      .populate('gameId', 'name difficulty');
    
    if (!highScore) {
      return res.status(404).json({ error: 'No high score found for this game' });
    }
    
    res.json(highScore);
  } catch (error) {
    console.error('Error fetching high score:', error);
    res.status(500).json({ error: 'Failed to fetch high score' });
  }
});

// POST /api/highscore - Create/Update high score for a game
router.post('/', async (req, res) => {
  try {
    const { gameId, username, time } = req.body;
    
    if (!gameId || !username || !time) {
      return res.status(400).json({ error: 'gameId, username, and time are required' });
    }

    // verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // check if high score exists for this game
    const existingHighScore = await HighScore.findOne({ gameId });

    if (existingHighScore) {
      //  update only if new time is better
      if (time < existingHighScore.time) {
        existingHighScore.username = username;
        existingHighScore.time = time;
        await existingHighScore.save();
        
        return res.json({
          message: 'High score updated!',
          highScore: existingHighScore,
          isNewRecord: true,
        });
      } else {
        return res.json({
          message: 'Existing high score is better',
          highScore: existingHighScore,
          isNewRecord: false,
        });
      }
    } else {
      // create new high score
      const newHighScore = new HighScore({
        gameId,
        username,
        time,
        difficulty: game.difficulty,
      });

      await newHighScore.save();
      
      return res.status(201).json({
        message: 'High score created!',
        highScore: newHighScore,
        isNewRecord: true,
      });
    }
  } catch (error) {
    console.error('Error saving high score:', error);
    res.status(500).json({ error: 'Failed to save high score' });
  }
});

module.exports = router;
