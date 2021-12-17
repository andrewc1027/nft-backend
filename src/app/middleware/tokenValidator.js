require('dotenv').config();
const jwt = require('jsonwebtoken');
module.exports = async (req, res, next) => {
  const token = req.header('Authorization');
  if (token==undefined) {
    return res.status(403).json({
      message: 'Unauthorized',
    });
  }
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.signedUser;

    next();
  } catch (err) {
    return res.status(402).json({
      name: err.name,
      msg: err.message});
  }
};
