const express = require('express');
const router = express.Router();
const {
    getAllSourceCodes,
    getSourceCodeById,
    createSourceCode,
    updateSourceCode,
    deleteSourceCode
} = require('../controllers/sourceCodeController');

// CRUD Routes
router.get('/', getAllSourceCodes);          // Get all codes
router.get('/:id', getSourceCodeById);       // Get one code
router.post('/', createSourceCode);          // Add new code
router.put('/:id', updateSourceCode);        // Update code
router.delete('/:id', deleteSourceCode);     // Delete code

module.exports = router;
