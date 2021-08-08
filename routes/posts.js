const Post = require("../models/Post");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
// CREATE A POST

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(400).json(err);
  }
});
// UPDATE A POST

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("post has been updated");
    } else {
      res.status(403).json("you can only update your on posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// DELETE A POST

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log("post user id", post.userId);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json(post);
    } else {
      res.status(403).json("you can only delete your own posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// LIKE / UNLIKE  A POST

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $push: { likes: req.body.userId },
      });
      res.status(200).json("post has been liked");
    } else {
      await post.updateOne({
        $pull: { likes: req.body.userId },
      });
      res.status(200).json("post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// GET A POST

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
// GET TIMELINE POSTS

router.get("/timeline/:userId", async (req, res) => {
  // console.log("hola boal");
  try {
    const currentUser = await User.findById(req.params.userId);
    console.log("current user", currentUser);
    const userPosts = await Post.find({ userId: currentUser._id }).sort({
      createdAt: "descending",
    });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json({ dd: err });
  }
});

module.exports = router;
