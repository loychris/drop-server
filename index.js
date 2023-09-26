const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const path = require('path');
require('dotenv').config()


const HttpError = require("./models/http-error");
const templateRoutes = require("./routes/template-routes");
const dropRoutes = require("./routes/drop-routes");
const userRoutes = require("./routes/users-routes");
const commentRoutes = require('./routes/comment-routes');
const extensionRoutes = require('./routes/extension-routes');
const adminRoutes = require('./routes/admin-routes');
const chatRoutes = require('./routes/chat-routes');
const shopifyRoutes = require('./routes/shopify-routes'); 
const imageRoutes = require('./routes/image-routes'); 
const memeRoutes = require('./routes/meme-routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// serve static frontend file eg. js
app.use(express.static(path.join('public')))

// // // Delay simulator
// app.use((req, res, next) => {
//   setTimeout(() => next(), 2000)
// })

// Routes 
app.use('/api/chat', chatRoutes);
app.use("/api/extension", extensionRoutes);
app.use("/api/users", userRoutes);
app.use("/api", commentRoutes);
app.use("/", dropRoutes);
app.use("/api/template", templateRoutes);
app.use("/api", adminRoutes);
app.use("/api/shopify", shopifyRoutes); 
app.use("/api/image", imageRoutes);
app.use("/api/meme", memeRoutes);

// serve static frontend   
app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
})

// Error handling
app.use((error, req, res, next) => {
  console.log(error)
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error occured!",
  });
});


// Connect DB and start Server
console.log("trying to connect to the db...");
mongoose
.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@dropcluster.52lyz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // Add this option to enable index creation
  }
)
  .then(() => {
    console.log("Connected to db");
    console.log(`Listening on port ${port}`)
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
    console.log('Could not connect to db');
  });
