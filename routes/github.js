const express = require("express");
const axios = require("axios");
const router = express.Router();

const GITHUB_API_URL = "https://api.github.com/graphql";

router.get("/contributions/:username", async (req, res) => {
  const { username } = req.params;

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            colors
            weeks {
              contributionDays {
                date
                contributionCount
                color
                weekday
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      GITHUB_API_URL,
      {
        query,
        variables: { username }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const calendar = response.data.data.user.contributionsCollection.contributionCalendar;
    res.json(calendar);
  } catch (error) {
    console.error("❌ GitHub API error:", error.message);
    res.status(500).json({ error: "Failed to fetch butions" });
  }
});

module.exports = router;