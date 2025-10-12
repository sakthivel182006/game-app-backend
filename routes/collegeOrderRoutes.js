const express = require('express');
const router = express.Router();
const collegeOrderController = require('../controllers/collegeordercontroller');

router.post('/collegeorder/create', collegeOrderController.createOrder);
router.post('/collegeorder/verify', collegeOrderController.verifyPayment);



// ✅ Get all successful payments for a college
router.get('/collegeorder/success/:collegeid', collegeOrderController.getSuccessfulPayments);

// ✅ Get all failed orders for a college
router.get('/collegeorder/failed/:collegeid', collegeOrderController.getFailedOrders);

// ✅ Get all payment plans that this college has purchased
router.get('/collegeorder/plans/:collegeid', collegeOrderController.getPlansByCollege);

// ✅ Get all orders (paid + unpaid) for a college
router.get('/collegeorder/all/:collegeid', collegeOrderController.getAllOrders);

module.exports = router;
