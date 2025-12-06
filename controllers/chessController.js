const GameResult = require("../models/GameResult");

// 🔥 DIRECT TOKEN (you asked for this)
const TOKEN = "lip_1m3RtNftGzuQmgGrqf7c";

// =====================================================
//  BOT ACCOUNT UPGRADE
// =====================================================
exports.upgradeToBot = async (req, res) => {
  const url = "https://lichess.org/api/bot/account/upgrade";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    const text = await response.text();

    if (text.startsWith("<!DOCTYPE")) {
      return res.json({
        error: "Upgrade failed. Token invalid or account already upgraded."
      });
    }

    const data = JSON.parse(text);
    console.log("🔥 Bot Upgrade Response:", data);

    return res.json(data);

  } catch (error) {
    console.error("Upgrade Error:", error);
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
      "Authorization": `Bearer ${TOKEN}`,
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "clock.limit=300&clock.increment=0"
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to create games." });
  }

  const data = JSON.parse(text);
  console.log("Random Opponent:", data);
  res.json(data);
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
      "Authorization": `Bearer ${TOKEN}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to challenge AI." });
  }

  const data = JSON.parse(text);
  console.log("AI Game:", data);
  res.json(data);
};

// =====================================================
//  PRIVATE GAME
// =====================================================
exports.createPrivateGame = async (req, res) => {
  const url = "https://lichess.org/api/challenge/open";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "clock.limit=600&clock.increment=5"
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to create private game." });
  }

  const data = JSON.parse(text);
  console.log("Private Game:", data);
  res.json(data);
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
      "Authorization": `Bearer ${TOKEN}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE")) {
    return res.json({ error: "Account must be BOT to challenge users." });
  }

  const data = JSON.parse(text);
  console.log("Challenge User:", data);
  res.json(data);
};

// =====================================================
//  STREAM GAME RESULTS
// =====================================================
exports.streamGame = async (req, res) => {
  const gameId = req.params.gameId;
  const url = `https://lichess.org/api/stream/game/${gameId}`;

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  });

  console.log("♟ Streaming Game:", gameId);

  for await (const chunk of response.body) {
    const line = chunk.toString().trim();
    if (!line) continue;

    if (!line.startsWith("{")) continue;

    let data;
    try {
      data = JSON.parse(line);
    } catch {
      continue;
    }

    if (data.type === "gameFinish") {
      console.log("✔ GAME FINISHED:", data);

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
// ========== GET LICHESS ACCOUNT INFO ==========
exports.getAccountInfo = async (req, res) => {
  const url = "https://lichess.org/api/account";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    if (text.startsWith("<!DOCTYPE")) {
      return res.json({ error: "Token invalid or account login required." });
    }

    const data = JSON.parse(text);
    console.log("Account Info:", data);

    return res.json(data);

  } catch (error) {
    console.error("Account error:", error);
    res.status(500).json({ error: "Failed to fetch account" });
  }
};
