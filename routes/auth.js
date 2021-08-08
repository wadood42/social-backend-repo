const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// REGISTER ROUTES

const generateToken = async (user) => {
  const token = await jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      followings: user.followings,
      followers: user.followers,
    },
    process.env.SECRET_KEY
  );

  return token;
};
router.post("/register", async (req, res) => {
  const newUser = await new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    // generate new bcrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // creating new user
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    const token = await generateToken(user);
    res.status(200).json({ token: token, user: user });
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json("incorrect password");
    }
    const token = await generateToken(user);
    res.status(200).json({ token: token, user: user });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
