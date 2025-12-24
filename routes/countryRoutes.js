const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const {
    createCountry,
    getAllCountries,
    updateCountry,
    deleteCountry,
    downloadCountriesPDF
} = require("../controllers/countryController");

// ensure uploads folder
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// CRUD
router.post("/add", upload.single("country_image"), createCountry);
router.get("/all", getAllCountries);
router.put("/update/:id", upload.single("country_image"), updateCountry);
router.delete("/delete/:id", deleteCountry);

// PDF
router.get("/download-pdf", downloadCountriesPDF);

module.exports = router;
