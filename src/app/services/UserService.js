
const User = require('../models/User');

/**
 * @param {String} address
 */
async function findAndRegister(address) {
  User.find({address: address}, function(err, user) {
    if (err) {
      throw err;
    }
    if (user.length == 0) {
      const newUser = register(address);
      return newUser;
    }
    // generate jwt
    console.log(user[0]);
    return user[0];
  });
}

/**
 * @param {String} address
 */
async function find(address) {
  User.findById(address, function(err, user) {
    if (err) throw err;
    return user;
  });
}

/**
 * @param {String} address
 */
async function register(address) {
  User.create({
    address: address,
  }, function(err, user) {
    if (err) return err;
    return user;
  });
}

module.exports = {
  find,
  findAndRegister,
};
