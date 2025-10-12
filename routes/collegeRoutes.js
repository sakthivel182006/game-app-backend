const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');

// Register a new college
router.post('/add', collegeController.addCollege);

// College login
router.post('/login', collegeController.loginCollege);

// Get all colleges
router.get('/', collegeController.getColleges);

module.exports = router;
