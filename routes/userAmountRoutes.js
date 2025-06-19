const express = require('express');
const router = express.Router();
const userAmountController = require('../controllers/userAmountController');

// GET user earnings
router.get('/users/:userId/earnings', userAmountController.getUserEarningsByUserId);

// Deduct specific amount from user's earnings (amount in URL)
router.put('/deduct-earnings/:userId/:amount', userAmountController.deductUserAmount);



// Calculate amounts for a specific user
router.get('/calculate-amounts/:userId', userAmountController.compileUserEarnings);

module.exports = router;