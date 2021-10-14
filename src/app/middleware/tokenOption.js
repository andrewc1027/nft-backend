require('dotenv').config();
const jwt = require('jsonwebtoken');
module.exports = async (req, res, next) => {
  const token = req.header('Authorization');
  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (decoded) {
      req.user = decoded.signedUser;
    }
  });
  next();
};
