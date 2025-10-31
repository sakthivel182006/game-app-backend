const axios = require("axios");
require("dotenv").config();

exports.runCode = async (req, res) => {
  try {
    const { language, code, input } = req.body;

    const languageIds = {
      cpp: 54,      // C++ (GCC 9.2.0)
      java: 62,     // Java (OpenJDK 13.0.1)
      python: 71,   // Python (3.8.1)
    };

    const langId = languageIds[language];
    if (!langId) return res.status(400).json({ error: "Invalid language" });

    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: langId,
        stdin: input || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    res.json({ output: response.data.stdout || response.data.stderr || "No output" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
