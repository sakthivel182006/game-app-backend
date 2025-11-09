const Feedback = require("../models/Feedback");

exports.createFeedback = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const feedback = new Feedback({ name, phone, email, message });
    await feedback.save();

    res.status(201).json({ success: true, message: "Feedback saved successfully.", feedback });
  } catch (error) {
    res.status(500).json({ error: "Failed to save feedback." });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback." });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: "Feedback not found." });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Error fetching feedback." });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ error: "Feedback not found." });
    res.status(200).json({ success: true, message: "Feedback deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feedback." });
  }
};
