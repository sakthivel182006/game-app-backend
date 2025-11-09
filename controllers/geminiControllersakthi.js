import axios from "axios";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt cannot be empty" });
    }

    // ✅ Use your free Gemini API key
    const GEMINI_API_KEY = "AIzaSyBIp9n-yXn-TrfAAz8poJVS9t174nrahwo";

    // ✅ Free-tier supported endpoint (Gemini 2.5 Flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // ✅ Make request to Gemini API
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    res.json({ reply: text });
  } catch (error) {
    console.error("❌ Gemini API REST Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.response?.data || error.message,
    });
  }
};
