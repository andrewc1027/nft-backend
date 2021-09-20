const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

//const jwt = require('jsonwebtoken');
const config = require("config");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const {
  User,
  validateUser,
  validatePassword,
  
} = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();



router.get('/page', auth, async (req, res) => {
  if(!req.query.index || !req.query.pageSize) {
  return res.status(400).send('неверные параметры"');
  }

  let index = +req.query.index;

  if(index == 0) return res.status(400).send('индекс равен нулю');
  --index;

// условие для поиска
  const filterObj = {};
  const reg = new RegExp(req.query.search, "i")
  if (
    typeof req.query.search !== 'undefined' 
  ) {
    filterObj['$or'] = [
      {name: {$regex: reg}},
      {email: {$regex: reg}}
    ]
  }

  let pageSize = +req.query.pageSize;

  let users = await User
  .find(filterObj)
  .skip(index * pageSize)
  .limit(pageSize)
  .lean();

let total = await User.countDocuments(filterObj);

  console.log('DONE \'PAGE\' Total: '+ total );
  res.json({
    items: users,
    total: total
  });
});

router.get("/me", auth, async (req, res) => {
  const authUser = await User.findById(req.user._id).select("-password");
  //res.send(user);
  res.json({ user: authUser })
});

router.get("/", [auth], async (req, res) => {
  const userList = await User.find().sort("-dateOut");
  //console.log("Список юзеров:"+userList);
  res.json( {users: userList});
  //res.send(users);
});

router.get("/:id", [auth], async (req, res) => {
  const userfromDB = await User.findById(req.params.id);
  console.log(req.params.id);
  if (!userfromDB)
    return res.status(404).send("The User with the given ID was not found.");

  //res.send(user);
  console.log(userfromDB);
  res.json({user: userfromDB});
});

// router.post("/", async (req, res) => {
//   try {
//     console.log(" === Post user router === ");
//     console.log(req.body);
//     const { error } = validateUser(req.body);
//     if (error) return res.status(400).send(error.details[0].message);
//     if (!req.body.password)
//       return res.status(400).send("password should be defined"); //дполинтельная проверка на то оперделен ли вообще какойлибо пароль, потмоу что если его не указать в теле запроса вообще валидатор его не считает обязательным и пропустит в базу запись без пароля вообще

//     let user = await User.findOne({ email: req.body.email });
//     if (user) return res.status(400).send("User already registered.");

//     let phoneRegex = /[a-zA-Z]/;
//     if(req.body.phone && phoneRegex.test(req.body.phone)) return res.status(400).send("User phone should be valid");

//     user = new User(_.pick(req.body, ["name", "email", "password", "isAdmin", "phone"]));
//     console.log("Create user: ");
//     console.log(user);
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     user = await user.save()
//       .catch(e => {
//         throw error.details[0].message;
//       });
//     console.log("Saved user: ");
//     console.log(user);
//     const token = user.generateAuthToken();
//     res
//       .header("x-auth-token", token)
//       .send(_.pick(user, ["_id", "name", "email", "isAdmin", "phone"]));
//   } catch (error) {
//     console.log("User post router error: " + error);
//     return res.status(500).send("User post router error: " + error);
//   }
// });


router.post("/", async (req, res) => {
  console.log(" === Post user router === ");
  console.log(req.body);
  let retData = {
    status: false,
  };

  let user = null;

  try {
    // валидация
    const { error } = validateUser(req.body);

    if (error) {
      retData.errCode = "not-valid";

      throw new Error(error.details[0].message);
    }

    if (!req.body.password || req.body.password.length == 0) {
      //дполинтельная проверка на то оперделен ли вообще какойлибо пароль, потмоу что если его не указать в теле запроса вообще валидатор его не считает обязательным и пропустит в базу запись без пароля вообще

      retData.errCode = "empty-password";

      throw new Error("empty password");
    }

    if (!req.body.phone || req.body.phone.length == 0) {
      retData.errCode = "empty-phone";

      throw new Error("empty phone");
    }

    user = await User.findOne({
      email: { $regex: _.escapeRegExp(req.body.email), $options: "i" },
    });

    if (user) {
      retData.errCode = "registered";

      throw new Error("User already registered");
    }
  } catch (err) {
    retData.errMessage = err.message;

    return res.json(retData);
  }

  try {
    // создание юзера
    let userData = _.pick(req.body, ["name", "phone", "email", "password"]);
    // userData.type = USERTYPE_CLIENT;

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(req.body.password, salt);

    user = new User(userData);
    await user.save();

    retData.user = _.pick(user, ["_id", "name", "phone", "email"]);
    retData.status = true;

    res.header("x-auth-token", user.generateAuthToken()).send(retData);
    console.log(retData);
  } catch (err) {
    retData.errCode = "exception";
    retData.errMessage = err.message;
    return res.json(retData);
  }
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send("The User with the given ID was not found.");

  const saltedPassword = !req.body.password
    ? user.password
    : await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));

  user = await User.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        password: saltedPassword,
        isAdmin: req.body.isAdmin
      }
    },
    { new: true }
  );

  if (!user)
    return res.status(404).send("The User with the given ID was not found.");

  res.send(user);
});

router.post("/favorite-product", [auth], async (req, res) => {
  let retData = {
    success: false,
    mode: 0,
  };

  if (!req.user) {
    retData["noUser"] = true;
    res.json(retData);
    return;
  }

  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("The User with the given ID was not found.");
    }

    let found = false;
    let newList = [];

    if (Array.isArray(user.favorites)) {
      newList = user.favorites.filter((item) => {
        if (item == req.body.productId) {
          // у юзера есть фаворит с таким ID, удаляем
          found = true;
          return false;
        }
        return true;
      });
    }

    // у юзера нет фаворита с таким ID, добавляем
    if (!found) newList.push(mongoose.Types.ObjectId(req.body.productId));

    user.set({
      favorites: newList,
    });

    await user.save();
    retData.success = true;
    if (!found) retData.mode = 1;
    // added
    else retData.mode = -1; // removed
  } catch (err) {
    winston.error("user favorites err:", err);
    retData.message = err.message;
  }

  res.json(retData);
});

module.exports = router;
