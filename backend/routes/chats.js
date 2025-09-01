const express = require('express')
const router = express.Router()

// import controller 
const { login, signup, ResetPassword, getAllUser, signout, updateProfile } = require('../Controllers/User');
const { sendMessage, getChat, deleteMessage } = require('../Controllers/messageController');
const { verifyOtp } = require('../Controllers/verifyOtp');
const { chatWithAI } = require('../Controllers/aiController');
const { auth } = require("../middleware/auth"); // Assuming you'll create this middleware
const upload = require("../middleware/multer");

const groupController = require("../Controllers/groupController");

// User routes (login/signup do not need auth)
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/signup', signup);
router.post('/resetPassword', ResetPassword);
router.get("/signout", signout);

// Protected routes (require user authentication)
router.get('/getAll', auth, getAllUser);
router.put("/update-profile", auth, upload.single("image"), updateProfile);

// Chat routes
router.post('/sendMessage', auth, sendMessage);
router.get('/chat/:chatId', auth, getChat);
router.delete('/message/:messageId', auth, deleteMessage);

// Group routes
router.post("/create", auth, groupController.createGroup);
router.delete("/:groupId", auth, groupController.deleteGroup);
router.get("/user/:userId", auth, groupController.getUserGroups);
router.get("/search", auth, groupController.searchUsers);

// AI Chat route
router.post('/ai/chat', auth, chatWithAI);

module.exports = router;