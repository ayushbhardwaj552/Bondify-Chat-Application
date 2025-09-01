const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Enter valid 10-digit phone number'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  profileImage: {
    type: String,
    default: '',
  },
  accountVerified: {
    type: Boolean,
    default: true,
    select: true,
  },
   verificationCode:Number,
    verificationCodeExpire:Date,
    resetPasswordToken:String,
    resetPasswordExpire:Date,
gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: { type: Date },
  verified: {
  type: Boolean,
  default: false
},

}, { timestamps: true });




// 🔐 Method to compare password
userSchema.pre("save", async function (next) {
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log(enteredPassword)
  console.log(this.password)
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};



// Inside your User model
userSchema.methods.generateVerificationCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    this.verificationCode = code;
    this.verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return code;
};


module.exports = mongoose.model('User', userSchema);
