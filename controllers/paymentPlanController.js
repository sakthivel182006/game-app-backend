const PaymentPlan = require('../models/paymentPlanModel');

// ✅ Create a new payment plan
exports.createPaymentPlan = async (req, res) => {
  try {
    const { planname, noOfTeachers, amount, offer } = req.body;

    // Check for duplicate plan (same number of teachers)
    const existingPlan = await PaymentPlan.findOne({ noOfTeachers });
    if (existingPlan) {
      return res.status(400).json({ success: false, message: 'Payment plan for this number of teachers already exists.' });
    }

    const newPlan = new PaymentPlan({ planname, noOfTeachers, amount, offer }); // planname included
    await newPlan.save();
    res.status(201).json({ success: true, plan: newPlan });
  } catch (err) {
    console.error('Create Payment Plan Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment plan' });
  }
};

// ✅ Get all payment plans
exports.getAllPaymentPlans = async (req, res) => {
  try {
    const plans = await PaymentPlan.find();
    res.status(200).json({ success: true, plans });
  } catch (err) {
    console.error('Get Payment Plans Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payment plans' });
  }
};

// ✅ Update a payment plan by ID
exports.updatePaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { planname, noOfTeachers, amount, offer } = req.body;

    const plan = await PaymentPlan.findById(id);
    if (!plan) return res.status(404).json({ success: false, message: 'Payment plan not found' });

    // Update fields
    if (planname !== undefined) plan.planname = planname; // planname included
    if (noOfTeachers !== undefined) plan.noOfTeachers = noOfTeachers;
    if (amount !== undefined) plan.amount = amount;
    if (offer !== undefined) plan.offer = offer;

    await plan.save();
    res.status(200).json({ success: true, plan });
  } catch (err) {
    console.error('Update Payment Plan Error:', err);
    res.status(500).json({ success: false, message: 'Failed to update payment plan' });
  }
};

// ✅ Delete a payment plan by ID
exports.deletePaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await PaymentPlan.findByIdAndDelete(id);
    if (!plan) return res.status(404).json({ success: false, message: 'Payment plan not found' });

    res.status(200).json({ success: true, message: 'Payment plan deleted successfully' });
  } catch (err) {
    console.error('Delete Payment Plan Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete payment plan' });
  }
};
