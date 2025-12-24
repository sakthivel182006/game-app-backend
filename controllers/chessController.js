const GameResult = require("../models/GameResult");

// ✅ SAFE TOKEN (from .env)
const TOKEN = process.env.LICHESS_TOKEN;

// =====================================================
//  BOT ACCOUNT UPGRADE
// =====================================================
exports.upgradeToBot = async (req, res) => {
  const url = "https://lichess.org/api/bot/account/upgrade";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });

    const text = await response.text();

    if (text.startsWith("<!DOCTYPE")) {
      return res.json({
        error: "Upgrade failed. Token invalid or account already upgraded."
      });
    }

    return res.json(JSON.parse(text));

  } catch (error) {
    res.status(500).json({ error: "Upgrade request failed" });
  }
};

// =====================================================
//  CREATE RANDOM OPPONENT GAME
// =====================================================
exports.createRandomGame = async (req, res) => {
  const url = "https://lichess.org/api/challenge/open";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "clock.limit=300&clock.increment=0"
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to create games." });
  }

  res.json(JSON.parse(text));
};

// =====================================================
//  CREATE AI GAME
// =====================================================
exports.createAIgame = async (req, res) => {
  const level = req.body.level || 1;
  const url = `https://lichess.org/api/challenge/ai?level=${level}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json"
    }
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to challenge AI." });
  }

  res.json(JSON.parse(text));
};

// =====================================================
//  PRIVATE GAME
// =====================================================
exports.createPrivateGame = async (req, res) => {
  const url = "https://lichess.org/api/challenge/open";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "clock.limit=600&clock.increment=5"
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to create private game." });
  }

  res.json(JSON.parse(text));
};

// =====================================================
//  CHALLENGE SPECIFIC USER
// =====================================================
exports.createChallenge = async (req, res) => {
  const { username } = req.body;
  const url = `https://lichess.org/api/challenge/${username}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json"
    }
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to challenge users." });
  }

  res.json(JSON.parse(text));
};

// =====================================================
//  STREAM GAME RESULTS
// =====================================================
exports.streamGame = async (req, res) => {
  const gameId = req.params.gameId;
  const url = `https://lichess.org/api/stream/game/${gameId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json"
    }
  });

  for await (const chunk of response.body) {
    const line = chunk.toString().trim();
    if (!line.startsWith("{")) continue;

    const data = JSON.parse(line);

    if (data.type === "gameFinish") {
      const result = new GameResult({
        gameId,
        winner: data.winner || "draw",
        status: data.status,
        moves: data.moves || []
      });

      await result.save();
      return res.json({ success: true, result });
    }
  }
};

// =====================================================
//  GET ACCOUNT INFO
// =====================================================
exports.getAccountInfo = async (req, res) => {
  const url = "https://lichess.org/api/account";

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json"
      }
    });

    const text = await response.text();

    if (text.startsWith("<!DOCTYPE")) {
      return res.json({ error: "Token invalid." });
    }

    res.json(JSON.parse(text));

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
};
