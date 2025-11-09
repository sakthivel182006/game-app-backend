const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/send-feedback", async (req, res) => {
  const { name, email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sakthivelv202222@gmail.com",
        pass: "vjrriqtisknjfucn",
      },
      tls: {
        rejectUnauthorized: false, // ✅ fix for self-signed cert error
      },
    });

    const ownerMail = {
      from: "sakthivelv202222@gmail.com",
      to: "sakthivelv202222@gmail.com",
      subject: `💬 New Portfolio Feedback from ${name || "Anonymous"}`,
      html: `
        <h2>New Message from Portfolio</h2>
        <p><strong>Name:</strong> ${name || "N/A"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    const userMail = {
      from: "sakthivelv202222@gmail.com",
      to: email,
      subject: "✅ Thanks for contacting Sakthivel",
      html: `
        <p>Hi ${name || "there"},</p>
        <p>Thank you for contacting <strong>Sakthivel V</strong>. Your message has been received successfully.</p>
        <p>He will reach out to you soon.</p>
        <br/>
        <p>Warm regards,<br/>Sakthivel V<br/>Full Stack Developer</p>
      `,
    };

    await transporter.sendMail(ownerMail);
    await transporter.sendMail(userMail);

    res.status(200).json({ success: true, message: "Feedback sent successfully." });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    res.status(500).json({ error: "Failed to send feedback." });
  }
});

module.exports = router;
