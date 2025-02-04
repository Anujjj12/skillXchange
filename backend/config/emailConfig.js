const nodemailer = require("nodemailer");

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or an app-specific password
  },
});

// Check if transporter is correctly set up
console.log("Transporter initialized:", transporter);

module.exports = transporter; // ✅ Make sure you're exporting it properly
