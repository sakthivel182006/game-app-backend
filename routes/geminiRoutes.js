const express = require("express");
const router = express.Router();
const { askGemini } = require("../controllers/geminiControllersakthi.js");

// POST /gemini/ask
router.post("/ask", askGemini);

module.exports = router;
