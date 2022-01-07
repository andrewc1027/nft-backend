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
    req.admin = decoded.adm;
    if (!req.admin.verified) {
      return res.status(403).json({
        message: 'Admin Only Access',
      });
    }
    next();
  } catch (err) {
    return res.status(402).json({
      name: err.name,
      msg: err.message});
  }
};
