const express = require("express");
const {
  upgradeToBot,
  createRandomGame,
  createAIgame,
  createPrivateGame,
  createChallenge,
  streamGame,getAccountInfo
} = require("../controllers/chessController");

const router = express.Router();

// Upgrade account to BOT
router.post("/upgrade-bot", upgradeToBot);

// Game creation endpoints
router.post("/create/random", createRandomGame);
router.post("/create/ai", createAIgame);
router.post("/create/private", createPrivateGame);
router.post("/create/challenge", createChallenge);

// Stream game result
router.get("/stream/:gameId", streamGame);
router.get("/account", getAccountInfo);

module.exports = router;
