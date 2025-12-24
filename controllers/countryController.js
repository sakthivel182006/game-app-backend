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
            `attachment; filename=countries_report_${Date.now()}.pdf`
        );

        const doc = new PDFDocument({
            margin: 40,
            size: "A4",
            bufferPages: true
        });

        doc.pipe(res);

        /* ========= COVER ========= */
        doc.rect(0, 0, doc.page.width, doc.page.height).fill("#4361ee");

        doc.fillColor("white")
           .font("Helvetica-Bold")
           .fontSize(48)
           .text("WORLD COUNTRIES", 0, 150, {
               align: "center",
               width: doc.page.width
           });

        doc.addPage();

        /* ========= TABLE SETUP ========= */
        const rowHeight = 100;        // ⬅ taller row for big image
        const siWidth = 45;           // ⬅ smaller SI column
        const imageWidth = 200;       // ⬅ MUCH wider image column
        const countryWidth = 180;
        const currencyWidth = 120;

        const startX = 40;
        let y = 120;

        const drawHeader = () => {
            doc.fillColor("#4361ee")
               .rect(
                   startX,
                   y,
                   siWidth + imageWidth + countryWidth + currencyWidth,
                   rowHeight
               )
               .fill();

            doc.fillColor("white")
               .font("Helvetica-Bold")
               .fontSize(14);

            doc.text("No.", startX, y + 40, { width: siWidth, align: "center" });
            doc.text("Flag", startX + siWidth, y + 40, { width: imageWidth, align: "center" });
            doc.text("Country", startX + siWidth + imageWidth, y + 40, { width: countryWidth });
            doc.text(
                "Currency",
                startX + siWidth + imageWidth + countryWidth,
                y + 40,
                { width: currencyWidth }
            );

            y += rowHeight;
        };

        drawHeader();

        /* ========= ROWS ========= */
        for (let i = 0; i < countries.length; i++) {
            if (y + rowHeight > doc.page.height - 80) {
                doc.addPage();
                y = 80;
                drawHeader();
            }

            const c = countries[i];

            doc.fillColor(i % 2 === 0 ? "#ffffff" : "#f8fafc")
               .rect(
                   startX,
                   y,
                   siWidth + imageWidth + countryWidth + currencyWidth,
                   rowHeight
               )
               .fill();

            // SI No
            doc.fillColor("#000")
               .font("Helvetica-Bold")
               .fontSize(14)
               .text(i + 1, startX, y + 42, {
                   width: siWidth,
                   align: "center"
               });

            // 🔥 VERY BIG IMAGE 🔥
            const imgPath = path.join(__dirname, "../uploads", c.image);
            if (fs.existsSync(imgPath)) {
                doc.image(
                    imgPath,
                    startX + siWidth + 20,
                    y + 10,
                    {
                        width: 160,   // ⬅ BIGGER WIDTH
                        height: 80,   // ⬅ BIGGER HEIGHT
                        fit: [160, 80]
                    }
                );
            }

            // Country
            doc.font("Helvetica-Bold")
               .fontSize(16)
               .text(
                   c.countryName,
                   startX + siWidth + imageWidth,
                   y + 38,
                   { width: countryWidth }
               );

            // Currency
            doc.font("Helvetica")
               .fontSize(15)
               .text(
                   c.currencyName,
                   startX + siWidth + imageWidth + countryWidth,
                   y + 40,
                   { width: currencyWidth }
               );

            y += rowHeight;
        }

        /* ========= FOOTER ========= */
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc.fillColor("#64748b")
               .fontSize(10)
               .text(
                   `Page ${i + 1} of ${range.count}`,
                   40,
                   doc.page.height - 30,
                   { align: "center", width: doc.page.width - 80 }
               );
        }

        doc.end();

    } catch (err) {
        console.error("PDF ERROR:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
};
