const jwt = require('jsonwebtoken');
const BaseResponse = require('../models/BaseResponse');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      const response = BaseResponse.error('Access denied. No token provided.');
      return res.status(401).json(response);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const response = BaseResponse.error('Invalid token. User not found.');
      return res.status(401).json(response);
    }

    if (!user.isAdmin) {
      const response = BaseResponse.error('Access denied. Admin privileges required.');
      return res.status(403).json(response);
    }

    req.user = user;
    next();
  } catch (error) {
    const response = BaseResponse.error('Invalid token.', error.message);
    res.status(401).json(response);
  }
};

module.exports = adminAuth;
