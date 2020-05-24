const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
var bodyParser = require('body-parser')


const HttpError = require("./models/http-error");
// const chatRoutes = require("./routes/chat-routes");
const memeRoutes = require("./routes/meme-route");
const dropRoutes = require("./routes/drop-routes");
const userRoutes = require("./routes/users-routes");
const commentRoutes = require('./routes/comment-routes');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());
app.use("/api", commentRoutes);
app.use("/api/drop", dropRoutes);
app.use("/api/meme", memeRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error occured!",
  });
});

mongoose
  .connect(
    "mongodb+srv://Chris:OSb9ZEBM66Txcf5F@dropcluster-52lyz.mongodb.net/stream?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to db");
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
