const Message = require('../models/Message');
const mongoose = require('mongoose');

// send message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, groupId, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty."
      });
    }

    let chatId;
    if (groupId) {
      chatId = groupId;
    } else if (senderId && receiverId) {
      // For one-on-one chat, create a consistent chatId based on user IDs
      const sortedIds = [senderId, receiverId].sort();
      chatId = `${sortedIds[0]}-${sortedIds[1]}`;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid chat identifiers."
      });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId, // This can be null for group messages
      content,
      chatId, // Use the new chatId to link all messages in a conversation
      group: groupId // Link to the Group model if it's a group chat
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};


exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Use a single chatId to fetch messages for both direct and group chats
    const messages = await Message.find({ chatId })
      .populate("sender", "username profileImage") // Populate sender details
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (err) {
    console.error("❌ Error fetching chat:", err);
    res.status(500).json({ success: false, message: 'Error fetching chat' });
  }
};


// delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Add authentication check here later
    // if (message.sender.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "You are not authorized to delete this message" });
    // }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete Message Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};