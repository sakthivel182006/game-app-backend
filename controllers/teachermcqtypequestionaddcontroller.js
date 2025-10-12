const McqType = require('../models/McqType');
const McqQuestion = require('../models/mcqQuestionModel');

// ✅ Create MCQ Type
exports.createMcqType = async (req, res) => {
    try {
        const { teacherId, name, description, imageUrl, entryFee, startTimeBeforeStart, dueTimeBeforeStart } = req.body;

        if (!teacherId || !name || !startTimeBeforeStart || !dueTimeBeforeStart) {
            return res.status(400).json({ message: 'Teacher ID, name, start time and due time are required.' });
        }

        const newMcqType = new McqType({
            teacherId,
            name,
            description,
            imageUrl,
            entryFee: entryFee || 0,
            startTimeBeforeStart,
            dueTimeBeforeStart
        });

        const savedMcqType = await newMcqType.save();
        res.status(201).json({ message: 'MCQ Type created successfully!', data: savedMcqType });
    } catch (error) {
        console.error('Error creating MCQ Type:', error);
        res.status(500).json({ message: 'Server error creating MCQ Type', error: error.message });
    }
};

// ✅ Get all MCQ Types by teacher
exports.getMcqTypesByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const mcqTypes = await McqType.find({ teacherId });
        res.status(200).json({ success: true, data: mcqTypes });
    } catch (error) {
        console.error('Error fetching MCQ Types:', error);
        res.status(500).json({ success: false, message: 'Server error fetching MCQ Types', error: error.message });
    }
};

// ✅ Update MCQ Type
exports.updateMcqType = async (req, res) => {
    try {
        const { mcqId } = req.params;
        const { teacherId, name, description, imageUrl, entryFee, startTimeBeforeStart, dueTimeBeforeStart } = req.body;

        const mcqType = await McqType.findById(mcqId);
        if (!mcqType) return res.status(404).json({ message: 'MCQ Type not found.' });

        // Only teacher who created it can update
        if (mcqType.teacherId.toString() !== teacherId) {
            return res.status(403).json({ message: 'You are not authorized to update this MCQ Type.' });
        }

        mcqType.name = name || mcqType.name;
        mcqType.description = description || mcqType.description;
        mcqType.imageUrl = imageUrl || mcqType.imageUrl;
        mcqType.entryFee = entryFee !== undefined ? entryFee : mcqType.entryFee;
        mcqType.startTimeBeforeStart = startTimeBeforeStart || mcqType.startTimeBeforeStart;
        mcqType.dueTimeBeforeStart = dueTimeBeforeStart || mcqType.dueTimeBeforeStart;

        const updatedMcqType = await mcqType.save();
        res.status(200).json({ message: 'MCQ Type updated successfully!', data: updatedMcqType });
    } catch (error) {
        console.error('Error updating MCQ Type:', error);
        res.status(500).json({ message: 'Server error updating MCQ Type', error: error.message });
    }
};

// ✅ Create MCQ Question
exports.createMcqQuestion = async (req, res) => {
    try {
        const { mcqTypeId, question, options, answer } = req.body;

        if (!mcqTypeId || !question || !options || !answer) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingType = await McqType.findById(mcqTypeId);
        if (!existingType) return res.status(404).json({ message: 'MCQ Type not found.' });

        const requiredOptions = ['A', 'B', 'C', 'D'];
        for (let opt of requiredOptions) {
            if (!options[opt]) {
                return res.status(400).json({ message: `Option ${opt} is required.` });
            }
        }

        if (!requiredOptions.includes(answer)) {
            return res.status(400).json({ message: 'Answer must be one of A, B, C, or D.' });
        }

        const newQuestion = new McqQuestion({
            mcqTypeId,
            question,
            options,
            answer
        });

        const savedQuestion = await newQuestion.save();
        res.status(201).json({ message: 'MCQ Question created successfully!', data: savedQuestion });
    } catch (error) {
        console.error('Error creating MCQ Question:', error);
        res.status(500).json({ message: 'Server error creating MCQ Question', error: error.message });
    }
};
// ✅ Get all MCQ Questions for all MCQ Types of a teacher
exports.getAllMcqQuestionsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // 1️⃣ Find all MCQ Types of this teacher
        const mcqTypes = await McqType.find({ teacherId });
        if (!mcqTypes.length) {
            return res.status(404).json({ message: 'No MCQ Types found for this teacher.' });
        }

        // 2️⃣ Collect all MCQ Type IDs
        const mcqTypeIds = mcqTypes.map(mcq => mcq._id);

        // 3️⃣ Find all MCQ Questions for these types
        const mcqQuestions = await McqQuestion.find({ mcqTypeId: { $in: mcqTypeIds } });

        res.status(200).json({
            success: true,
            data: mcqQuestions
        });
    } catch (error) {
        console.error('Error fetching MCQ Questions:', error);
        res.status(500).json({ success: false, message: 'Server error fetching MCQ Questions', error: error.message });
    }
};
