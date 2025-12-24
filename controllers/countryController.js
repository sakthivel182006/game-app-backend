const Country = require("../models/Country");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

/* =========================
   CREATE
========================= */
exports.createCountry = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image required" });
        }

        const { country, currency } = req.body;

        const data = new Country({
            image: req.file.filename,
            countryName: country,
            currencyName: currency
        });

        await data.save();
        res.status(201).json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   READ ALL
========================= */
exports.getAllCountries = async (req, res) => {
    try {
        const data = await Country.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   UPDATE
========================= */
exports.updateCountry = async (req, res) => {
    try {
        const record = await Country.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Not found" });

        if (req.file) {
            const oldPath = path.join(__dirname, "../uploads", record.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            record.image = req.file.filename;
        }

        record.countryName = req.body.country;
        record.currencyName = req.body.currency;

        await record.save();
        res.json(record);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   DELETE
========================= */
exports.deleteCountry = async (req, res) => {
    try {
        const record = await Country.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Not found" });

        const imgPath = path.join(__dirname, "../uploads", record.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

        await Country.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   DOWNLOAD PDF (WITH IMAGES)
========================= */
exports.downloadCountriesPDF = async (req, res) => {
    try {
        const countries = await Country.find();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=country_details.pdf"
        );

        const doc = new PDFDocument({ margin: 30 });
        doc.pipe(res);

        doc.fontSize(18).text("Country Details", { align: "center" });
        doc.moveDown();

        countries.forEach((c, i) => {
            doc.fontSize(12).text(`SI No: ${i + 1}`);
            doc.text(`Country: ${c.countryName}`);
            doc.text(`Currency: ${c.currencyName}`);

            const img = path.join(__dirname, "../uploads", c.image);
            if (fs.existsSync(img)) {
                doc.image(img, { width: 80 });
            }

            doc.moveDown(2);
        });

        doc.end();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
