const User = require('../models/userSchema')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Otp = require('../models/Otp');
const {sendEmail} = require('../utils/sendEmail');
const nodeMailer = require('nodemailer');
const {verifyOTP} = require('./verifyOtp')

exports.signup = async (req, res) => {
    try {
        const { email, username, phone, password, confirmPassword, uploadImage } = req.body;

        // 🔍 Validate required fields
        if (!email || !username || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // 🔍 Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email or phone number",
            });
        }
   
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Please enter same password and confirmPassword",
            });
        }
        // 🔐 Hash password
        let hashPassword;
        try {
            hashPassword = await bcrypt.hash(password, 10);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Password cannot be hashed",
            });
        }
        let profileImage = uploadImage;
        if (!uploadImage) {
            const initials = username.slice(0, 2).toUpperCase();
            profileImage = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
        }
        // ✅ Create user
        const user = await User.create({
            email,
            username,
            phone,
            password: hashPassword,
           profileImage,
        });

        // 🧾 Generate OTP & save
        const verificationCode = await user.generateVerificationCode();
        await user.save();
        console.log(verificationCode);
        // 📧 Send verification code via email
        return await sendVerificationCode("email", verificationCode, email, phone, res, username);

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong during signup",
        });
    }
};

async function sendVerificationCode(verificationMethod, verificationCode, email, phone, res, name) {
    try {
        if (verificationMethod === "email") {
            const message = generateEmailTemplate(verificationCode);
            await sendEmail({ email, subject: "Your Verification Code", message });

            return res.status(200).json({
                success: true,
                message: `Verification email sent to ${name} successfully`
            });
        } else if (verificationMethod === "phone") {
            const codeSpaced = verificationCode.toString().split("").join(" ");

            await client.calls.create({
                twiml: `<Response><Say>Your verification code is ${codeSpaced}. Repeat, ${codeSpaced}.</Say></Response>`,
                from: process.env.TWILIO_PHONE,
                to: phone
            });

            return res.status(200).json({
                success: true,
                message: "Verification call sent successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid verification method"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Verification code failed to send"
        });
    }
}

function generateEmailTemplate(verificationCode) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff;">
        <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px; color: #333;">Dear User,</p>
        <p style="font-size: 16px; color: #333;">Your verification code is:</p>
        <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px;">
                ${verificationCode}
            </span>
        </div>
        <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
        <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
        <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
            <p>Thank you,<br>Your Company Team</p>
            <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
        </footer>
    </div>
    `;
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user + include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "This email is not registered.",
      });
    }

    // Check if account is verified
    if (!user.accountVerified) {
        return res.status(401).json({
            success: false,
            message: "Account not verified. Please verify your email.",
        });
    }

    // Compare password
    const isPasswordMatched = await user.comparePassword(password);
   
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Optional: Clear password from memory (best practice)
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
    });
  }
};


// ... (existing signout, ResetPassword, afterResetPassword, and getAllUser logic)

exports.updateProfile = async (req, res) => {
  try {
    const { username, phone, gender, dob, profileImage } = req.body;
    const userId = req.user.id; // Assuming you have a middleware to extract user ID from the JWT

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        phone,
        gender,
        dob,
        profileImage,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Could not update profile.",
    });
  }
};

// signout 
// logout controller
exports.signout = async (req, res) => {
  try {
    // Option 1: If you're using JWT stored in HTTP-only cookie
    res.clearCookie("token"); // if your token is stored in cookie

    // Option 2: If you're storing JWT in frontend (e.g., localStorage)
    // Just tell frontend to remove the token
    return res.status(200).json({
      success: true,
      message: "Signout successful",
    });
  } catch (error) {
    console.error("Signout error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during signout",
    });
  }
};



exports.ResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email",
            });
        }

        // 2. Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "You are not registered yet",
            });
        }

        // 3. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Set OTP expiration time (e.g., 5 minutes from now)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 5. Check if OTP already exists and update or create new
        const existingOtp = await Otp.findOne({ email });
        if (existingOtp) {
            existingOtp.otp = otp;
            existingOtp.expiresAt = expiresAt;
            await existingOtp.save();
        } else {
            await Otp.create({ email, otp, expiresAt });
        }

        // 6. Send OTP Email
        const message = `
            <h1>Password Reset OTP</h1>
            <p>Your OTP for password reset is:</p>
            <h2>${otp}</h2>
            <p>This OTP will expire in 5 minutes.</p>
        `;

        await sendEmail({
            email,
            subject: "Password Reset OTP",
            message,
        });

        // 7. Return success response
        return res.status(200).json({
            success: true,
            message: otp,
        });

     

    } catch (error) {
        console.log("ResetPassword error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        });
    }


};


exports.afterResetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    // Input validation
    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if OTP exists for the given email
    const storedOtpEntry = await Otp.findOne({ email });

    if (!storedOtpEntry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email',
      });
    }

    // Compare OTPs
    if (storedOtpEntry.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Optional: delete OTP after successful use
    await Otp.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Error in afterResetPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};


exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find({}, 'name'); // Only select the 'name' field
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error while fetching users',
    });
  }
};

// create group
