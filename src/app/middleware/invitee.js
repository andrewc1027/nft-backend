require('dotenv').config();
const jwt = require('jsonwebtoken');
module.exports = async (req, res, next) => {
  const token = req.header('Authorization');
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const user = decoded.signedUser;
  if (!user.invited) {
    return res.status(403).json({
      message: 'Invite Only Access',
    });
  }
  next();
};
