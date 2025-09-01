const nodemailer = require("nodemailer");

exports.sendEmail = async ({ email, subject, message }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,         // e.g., "smtp.gmail.com"
      service: process.env.SMTP_SERVICE,   // e.g., "gmail"
      port: process.env.SMTP_PORT,         // e.g., 587
      secure: true,                       // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_MAIL,       // Your email
        pass: process.env.SMTP_PASSWORD,   // Your email password or app password
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: message, // You can also use `text: 'plain text'` if not using HTML
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", email);
  } catch (error) {
    console.error("❌ Error while sending email:", error.message);
    throw error;
  }
};
