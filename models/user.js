const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const USERTYPE_CLIENT = 1; // клиент
const USERTYPE_SALES_MANAGER = 2; // торгпред
const USERTYPE_ADMIN = 99;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  // isAdmin: {
  //   type: Boolean,
  //   required: false
  // },
  // phone: {
  //   type: String,
  //   required: false
  // },
  // registerDate: {
  //   type: Date,
  //   default: Date.now
  // },
  // favorites: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Product",
  //   },
  // ],
});

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(2).max(50),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),//req.body.password - убрал обязательность наличия пароля при валидации чтобы модно было менять любые атрибуты пользовтаеля без указания пароля, теперь в POSTe на создание юзера надо вручную дополнительно првоерить передается ли пароль, потому что в модели USERа этот аттрибут все равно остался обязательным
    isAdmin: Joi.boolean(),
    favorites: Joi.array(),
    phone: Joi.string(),
    registerDate: Joi.string()
  };

  return Joi.validate(user, schema);
}


//copied from orav
// async function checkUserFields(user) {
//   let changed = false;

//   if (typeof user.type === "undefined") {
//     if (user._doc.isAdmin) user.set({ type: USERTYPE_ADMIN });
//     else user.set({ type: USERTYPE_CLIENT });
//     changed = true;
//   }

//   if (typeof user.favorites === "undefined") {
//     user.set({ favorites: [] });
//     changed = true;
//   }

//   // дополнительные проверки тут

//   if (changed) {
//     await user.save();
//   }

//   return user;
// }

function validatePassword(password) {
  const schema = {
    password: Joi.string().min(4).max(255),
  };

  return Joi.validate(password, schema);
}

exports.User = User; 
exports.validateUser = validateUser;
exports.validatePassword = validatePassword;