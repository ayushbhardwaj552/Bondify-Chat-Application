const Group = require("../models/groupSchema");
const User = require("../models/userSchema");

// Create a new group
exports.createGroup = async (req, res) => {
  const { name, memberIds, createdBy } = req.body;

  if (!name || !memberIds || !createdBy) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const group = await Group.create({
      name,
      members: memberIds,
      createdBy,
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating group" });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    await Group.findByIdAndDelete(groupId);
    res.status(200).json({ success: true, message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting group" });
  }
};

// Get all groups a user is a member of
exports.getUserGroups = async (req, res) => {
  const { userId } = req.params;

  try {
    const groups = await Group.find({ members: userId }).populate("members", "name email");
    res.status(200).json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};


// serach all users 

// Search users by name or email
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("name email");

    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: "Error searching users" });
  }
};