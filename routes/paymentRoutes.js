const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const { createOrder, paymentSuccess, getBalanceByUserId, getTransactionHistory,checkMcqTypePurchased,updatePayment } = paymentController;

router.post('/create-order', createOrder);

router.post('/payment-success', paymentSuccess);

router.get('/balance/:userId', getBalanceByUserId);

router.get('/transactions/:userId', getTransactionHistory);

router.put('/updateamount/:userId/:amount', updatePayment);

router.get('/mcqtype-purchased/:userId/:mcqTypeId', checkMcqTypePurchased);

router.post('/purchase', paymentController.purchaseProduct);

module.exports = router;
