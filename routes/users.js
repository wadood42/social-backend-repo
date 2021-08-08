const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const Post = require("../models/Post");

router.get("/", async (req, res) => {
  console.log("getting all users", req.query.q);

  const username = req.query.q;

  const users = await User.find(
    { username: { $regex: ".*" + username + ".*", $options: "i" } },
    "username"
  ).limit(4);

  if (users.length === 0) {
    return res.status(400).json({ msg: "no user found" });
  }

  res.status(200).json(users);
});
// GETTING 4 USERS

router.get("/users-to-follow", async (req, res) => {
  const users = await User.find().limit(4);

  res.status(200).json(users);
});
// UPDATE USER

router.put("/:id", async (req, res) => {
  //   console.log("req.body.userId", req.body.userId);
  //   console.log("req.params.id", req.params.id);
  //   console.log(req.body.userId === req.params.id);
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can only update your account");
  }
});

// GET USER'S ALL POSTS
router.get("/profile/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  const userPosts = await Post.find({ userId: user.id });

  // console.log("found posts user with username", userPosts);

  res.status(200).json({ posts: userPosts, user: user });
});
// DELETE USER
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(400).json(err);
    }
  } else {
    res.status(400).json("You can only delete your account");
  }
});
// GET A USER
router.get("/:id", async (req, res) => {
  // console.log("req to get a user", req);
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json({ user: other });
  } catch (err) {
    res.status(400).json("no user found");
  }
});
// FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: { followers: req.body.userId },
        });
        await currentUser.updateOne({
          $push: { followings: req.params.id },
        });

        res.status(200).json({ followedUserId: user._id });
      } else {
        res.status(403).json("You alreay following this user");
      }
    } catch (err) {
      res.status(400).json(err);
    }
  } else {
    res.status(403).json("You cant follow yourself");
  }
});
// UNFOLLOW A USER

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json({ unfollowedUserId: user._id });
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
