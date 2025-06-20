const Purchase = require('../models/Purchase');

// 1. Create a new purchase (POST)
exports.createPurchase = async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    const saved = await purchase.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. Get all purchases (GET)
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find();
    res.status(200).json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Get purchases by loginuserid (GET)
exports.getPurchasesByUserId = async (req, res) => {
  try {
    const { loginuserid } = req.params;
    const purchases = await Purchase.find({ loginuserid });
    if (!purchases.length) {
      return res.status(404).json({ message: 'No purchases found for this user.' });
    }
    res.status(200).json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Update a purchase by ID (PUT)
exports.updatePurchase = async (req, res) => {
  try {
    const updated = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Purchase not found.' });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 5. Delete a purchase by ID (DELETE)
exports.deletePurchase = async (req, res) => {
  try {
    const deleted = await Purchase.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Purchase not found.' });
    }
    res.status(200).json({ message: 'Purchase deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
