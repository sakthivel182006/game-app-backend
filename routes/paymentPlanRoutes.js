const express = require('express');
const router = express.Router();
const paymentPlanController = require('../controllers/paymentPlanController');

// CRUD routes
router.post('/create', paymentPlanController.createPaymentPlan);
router.get('/', paymentPlanController.getAllPaymentPlans);
router.put('/update/:id', paymentPlanController.updatePaymentPlan);
router.delete('/delete/:id', paymentPlanController.deletePaymentPlan);

module.exports = router;
