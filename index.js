const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');


const HttpError = require("./models/http-error");
// const chatRoutes = require("./routes/chat-routes");
const memeRoutes = require("./routes/meme-route");
const dropRoutes = require("./routes/drop-routes");
const userRoutes = require("./routes/users-routes");
const commentRoutes = require('./routes/comment-routes');
const extensionRoutes = require('./routes/extension-routes');

const User = require('./models/user');
const Comment = require('./models/comment');
const Drop = require('./models/drop');


const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Controll-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next();
});

// Delay simulator
// app.use((req, res, next) => {
//   setTimeout(() => next(), 1000)
// })


app.use("/api/extension", extensionRoutes);
app.use("/api/users", userRoutes);
app.use("/api", commentRoutes);
app.use("/api/drop", dropRoutes);
app.use("/api/meme", memeRoutes);

app.delete('/purgeDB', (req, res, next) => {
  Drop.deleteMany({}).exec()
  .then(() => {
    console.log('All drops removed');
    User.deleteMany({}).exec()
    .then(() => {
      console.log('All users removed');
      res.json({message: "All drops & Users removed"});
    })
    .then(() => {
      const directory = path.join(__dirname, 'DB');
      fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      });
    });
  });
});

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

console.log("trying to connect to the db...");
mongoose
  .connect(
    "mongodb+srv://Chris:V60CRFG7JtMrAPwN@dropcluster.52lyz.mongodb.net/stream?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to db");
    console.log(`Listening on port ${port}`)
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
