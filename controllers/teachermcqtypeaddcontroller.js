const McqType = require('../models/McqType');
const Teacher = require('../models/teacher');

// Create MCQ Type
exports.createMcqType = async (req, res) => {
    const { name, description, imageUrl, entryFee, startTimeBeforeStart, dueTimeBeforeStart, teacherId } = req.body;

    if (!name || !startTimeBeforeStart || !dueTimeBeforeStart) {
        return res.status(400).json({ message: 'Name, start time, and due time are required.' });
    }

    try {
        // Validate teacher
        let validTeacherId = null;
        if (teacherId) {
            const teacher = await Teacher.findById(teacherId);
            if (!teacher || teacher.role !== 'teacher') {
                return res.status(400).json({ message: 'Invalid teacher ID or role.' });
            }
            validTeacherId = teacher._id;
        }

        // Check for duplicate MCQ name
        const existingType = await McqType.findOne({ name });
        if (existingType) {
            return res.status(409).json({ message: 'An MCQ type with this name already exists.' });
        }

        // Convert times to IST
        const istOffset = 5.5 * 60;
        const startTime = new Date(new Date(startTimeBeforeStart).getTime() + istOffset * 60000);
        const dueTime = new Date(new Date(dueTimeBeforeStart).getTime() + istOffset * 60000);

        const newMcqType = new McqType({
            name,
            description,
            imageUrl,
            entryFee: entryFee || 0,
            startTimeBeforeStart: startTime,
            dueTimeBeforeStart: dueTime,
            teacherId: validTeacherId
        });

        const savedMcqType = await newMcqType.save();
        res.status(201).json({ message: 'MCQ type created successfully!', mcqType: savedMcqType });

    } catch (error) {
        console.error('Error creating MCQ type:', error);
        res.status(500).json({ message: 'Server error creating MCQ type.' });
    }
};

// Get MCQ Types by Teacher ID
exports.getMcqTypesByTeacher = async (req, res) => {
    const { teacherId } = req.params;

    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Invalid teacher ID or role.' });
        }

        const mcqTypes = await McqType.find({ teacherId });
        res.status(200).json({ success: true, data: mcqTypes });
    } catch (error) {
        console.error('Error fetching MCQ types:', error);
        res.status(500).json({ message: 'Server error fetching MCQ types.' });
    }
};

// Update MCQ Type
exports.updateMcqType = async (req, res) => {
    const { mcqTypeId } = req.params;
    const { name, description, imageUrl, entryFee, startTimeBeforeStart, dueTimeBeforeStart } = req.body;

    try {
        const mcqType = await McqType.findById(mcqTypeId);
        if (!mcqType) {
            return res.status(404).json({ message: 'MCQ type not found.' });
        }

        if (name) mcqType.name = name;
        if (description) mcqType.description = description;
        if (imageUrl) mcqType.imageUrl = imageUrl;
        if (entryFee !== undefined) mcqType.entryFee = entryFee;

        const istOffset = 5.5 * 60;
        if (startTimeBeforeStart) mcqType.startTimeBeforeStart = new Date(new Date(startTimeBeforeStart).getTime() + istOffset * 60000);
        if (dueTimeBeforeStart) mcqType.dueTimeBeforeStart = new Date(new Date(dueTimeBeforeStart).getTime() + istOffset * 60000);

        const updatedMcqType = await mcqType.save();
        res.status(200).json({ message: 'MCQ type updated successfully!', mcqType: updatedMcqType });

    } catch (error) {
        console.error('Error updating MCQ type:', error);
        res.status(500).json({ message: 'Server error updating MCQ type.' });
    }
};
