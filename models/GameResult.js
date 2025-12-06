const mongoose = require("mongoose");

const gameResultSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  winner: { type: String },
  status: { type: String },
  moves: { type: Array },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GameResult", gameResultSchema);
