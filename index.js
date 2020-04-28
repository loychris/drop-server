const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const HttpError = require("./models/http-error");
const chatRoutes = require("./routes/chat-routes");
const streamRoutes = require("./routes/stream-routes");
const memeRoutes = require("./routes/meme-route");
const dropRoutes = require("./routes/drop-routes");

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use(chatRoutes);
app.use("/api/drop", dropRoutes);
app.use("/api/meme", memeRoutes);
app.use(streamRoutes);

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
    "mongodb+srv://Chris:88z5QXa22z3mJJx1@dropcluster-52lyz.mongodb.net/stream?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to db");
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
