require('dotenv').config();
const jwt = require('jsonwebtoken');
module.exports = async (req, res, next) => {
  const token = req.header('Authorization');
  if (token==undefined) {
    return res.status(403).json({
      message: 'Unauthorized',
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err) {
      return res.status(500).json(err);
    }
    req.user = decoded.user;
  });
  next();
};
