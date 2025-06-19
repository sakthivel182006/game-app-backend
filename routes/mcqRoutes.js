    // routes/mcqRoutes.js

    const express = require('express');
    const router = express.Router();
    const mcqController = require('../controllers/mcqController');

    // Get all MCQ types
    router.get('/mcqtypes', mcqController.getAllMcqTypes);
    router.get('/mcq-types/:id', mcqController.getMcqTypeById);

    // Create a new MCQ type
    router.post('/mcqtypes', mcqController.createMcqType);

    // Update an existing MCQ type
    router.put('/mcqtypes/:id', mcqController.updateMcqType);

    // Delete an MCQ type
    router.delete('/mcqtypes/:id', mcqController.deleteMcqType);

    module.exports = router;
