const express = require("express");
const helmet = require("helmet");
const app = express();
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./configs/.env" });

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log("Listening for requests on port", PORT);
    });
  })
  .catch((err) => console.log("error connecting to MongoDB", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES FOR USER
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
