const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
} = require("../controllers/feedbackController");

router.post("/", createFeedback);
router.get("/", getAllFeedback);
router.get("/:id", getFeedbackById);
router.delete("/:id", deleteFeedback);

module.exports = router;
