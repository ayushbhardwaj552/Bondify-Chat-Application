const { sendEmail } = require("./sendEmail");

exports.sendVerificationCode = async (channel, code, email, phone, res, name) => {
  try {
    if (channel === "email") {
      const subject = "Verify your email";
      const message = `
        <h2>Hello ${name},</h2>
        <p>Your verification code is: <b>${code}</b></p>
        <p>This code is valid for 10 minutes.</p>
      `;

      await sendEmail({ email, subject, message });

      return res.status(200).json({
        success: true,
        message: "Verification code sent successfully to your email",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported channel for sending OTP",
      });
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send",
    });
  }
};
