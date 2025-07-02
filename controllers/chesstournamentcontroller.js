const McqType = require('../models/chesstournament');

exports.getAllMcqTypes = async (req, res) => {
    try {
        const mcqTypes = await McqType.find({});
        res.status(200).json(mcqTypes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching MCQ types.' });
    }
};

exports.getMcqTypeById = async (req, res) => {
    const { id } = req.params;

    try {
        const mcqType = await McqType.findById(id);

        if (!mcqType) {
            return res.status(404).json({ message: 'MCQ type not found.' });
        }

        res.status(200).json(mcqType);
    } catch (error) {
        console.error('Error fetching MCQ type by ID:', error);
        res.status(500).json({ message: 'Server error fetching MCQ type by ID.' });
    }
};
exports.createMcqType = async (req, res) => {
    const { name, description, imageUrl, entryFee, startTimeBeforeStart, dueTimeBeforeStart } = req.body;

    if (!name || !startTimeBeforeStart || !dueTimeBeforeStart) {
        return res.status(400).json({ message: 'Name, start time, and due time are required.' });
    }

    try {
        const existingType = await McqType.findOne({ name });
        if (existingType) {
            return res.status(409).json({ message: 'An MCQ type with this name already exists.' });
        }

        const newMcqType = new McqType({
            name,
            description,
            imageUrl,
            entryFee: entryFee || 0,
            startTimeBeforeStart: new Date(startTimeBeforeStart),
            dueTimeBeforeStart: new Date(dueTimeBeforeStart)
        });

        const savedMcqType = await newMcqType.save();

        res.status(201).json({ message: 'MCQ type created successfully!', mcqType: savedMcqType });
    } catch (error) {
        console.error('Error creating MCQ type:', error);
        res.status(500).json({ message: 'Server error creating MCQ type.' });
    }
};
exports.updateMcqType = async (req, res) => {
    const { id } = req.params;
    const { name, description, imageUrl, entryFee, startTimeBeforeStart, dueTimeBeforeStart } = req.body;

    try {
        const updatedMcqType = await McqType.findByIdAndUpdate(
            id,
            { 
                name, 
                description, 
                imageUrl, 
                entryFee, 
                startTimeBeforeStart: new Date(startTimeBeforeStart),
                dueTimeBeforeStart: new Date(dueTimeBeforeStart)
            },
            { new: true, runValidators: true }
        );

        if (!updatedMcqType) {
            return res.status(404).json({ message: 'MCQ Type not found.' });
        }

        res.status(200).json({ message: 'MCQ type updated successfully!', mcqType: updatedMcqType });
    } catch (error) {
        console.error('Error updating MCQ type:', error);
        res.status(500).json({ message: 'Server error updating MCQ type.' });
    }
};

exports.deleteMcqType = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMcqType = await McqType.findByIdAndDelete(id);

        if (!deletedMcqType) {
            return res.status(404).json({ message: 'MCQ Type not found.' });
        }

        res.status(200).json({ message: 'MCQ type deleted successfully!', mcqType: deletedMcqType });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting MCQ type.' });
    }
};

