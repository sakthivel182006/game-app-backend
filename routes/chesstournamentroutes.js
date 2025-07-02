    // routes/mcqRoutes.js

    const express = require('express');
    const router = express.Router();
    const mcqController = require('../controllers/chesstournamentcontroller');

    // Get all MCQ types
    router.get('/mcqtypes', mcqController.getAllMcqTypes);
    router.get('/mcq-types/:id', mcqController.getMcqTypeById);

    router.post('/mcqtypes', mcqController.createMcqType);

    router.put('/mcqtypes/:id', mcqController.updateMcqType);

    router.delete('/mcqtypes/:id', mcqController.deleteMcqType);

    module.exports = router;
