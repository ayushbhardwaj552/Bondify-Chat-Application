const jwt = require('jsonwebtoken');
const User = require('../models/userSchema'); // Assuming your User model path

exports.auth = async (req, res, next) => {
  try {
    // Extract token from request headers
    // It's usually sent as "Bearer TOKEN"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request object
    req.user = decoded; // decoded contains { id: user._id, email: user.email }

    // Optional: Fetch full user object from DB if needed
    // const user = await User.findById(decoded.id).select('-password');
    // if (!user) {
    //   return res.status(401).json({ success: false, message: 'User not found for this token.' });
    // }
    // req.user = user; // Attach full user object

    next(); // Move to the next middleware/controller
  } catch (error) {
    console.error('Authentication Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid. Please log in again.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};
