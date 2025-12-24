const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    countryName: {
        type: String,
        required: true
    },
    currencyName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Country", countrySchema);
