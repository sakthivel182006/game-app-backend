const McqQuestion = require('../models/mcqQuestionModel');

// ✅ Create a new MCQ question (POST)
exports.createMcqQuestion = async (req, res) => {
  try {
    const newMcq = new McqQuestion(req.body);
    const savedMcq = await newMcq.save();
    res.status(201).json(savedMcq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllMcqQuestions = async (req, res) => {
  try {
    const questions = await McqQuestion.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMcqQuestion = async (req, res) => {
  try {
    const updated = await McqQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'MCQ not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get all MCQ questions by mcqTypeId (GET)
exports.getMcqQuestionsByTypeId = async (req, res) => {
  try {
    const { mcqTypeId } = req.params;

    const questions = await McqQuestion.find({ mcqTypeId });

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No MCQ questions found for this mcqTypeId' });
    }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Delete an MCQ question (DELETE)
exports.deleteMcqQuestion = async (req, res) => {
  try {
    const result = await McqQuestion.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'MCQ not found' });
    res.status(200).json({ message: 'MCQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
