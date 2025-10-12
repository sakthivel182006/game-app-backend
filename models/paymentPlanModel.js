const mongoose = require('mongoose');

const paymentPlanSchema = new mongoose.Schema({
 planname:{type:String,required:true},
  noOfTeachers: { type: Number, required: true },
  amount: { type: Number, required: true },
  offer: { type: Number, default: 0 } // optional discount
}, { timestamps: true });

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema);
