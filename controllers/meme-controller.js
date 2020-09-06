const path = require("path");
const fs = require("fs");

const HttpError = require("../models/http-error");

/////////////// get array with all the paths ///////////
let filenamesArr = [];

function promisify(fn) {
  return function promisified(...params) {
    return new Promise((resolve, reject) =>
      fn(...params.concat([
          (err, ...args) =>
            err ? reject(err) : resolve(args.length < 2 ? args[0] : args),
      ]))
    );
  };
}
const readdirAsync = promisify(fs.readdir);
readdirAsync("./memes/dez")
  .then((filenames) => {
    let marMemes = [];
    filenames.forEach((filename) => {
      marMemes.push(`dez/${filename}`);
    });
    filenamesArr = marMemes.concat(filenamesArr);
  })
  .then(() => {
    readdirAsync("./memes/jan").then((filenames) => {
      let marMemes = [];
      filenames.forEach((filename) => {
        marMemes.push(`jan/${filename}`);
      });
      filenamesArr = marMemes.concat(filenamesArr);
    });
  })
  .then(() => {
    readdirAsync("./memes/feb").then((filenames) => {
      let marMemes = [];
      filenames.forEach((filename) => {
        marMemes.push(`feb/${filename}`);
      });
      filenamesArr = marMemes.concat(filenamesArr);
    });
  })
  .then(() => {
    readdirAsync("./memes/mar").then((filenames) => {
      let marMemes = [];
      filenames.forEach((filename) => {
        marMemes.push(`mar/${filename}`);
      });
      filenamesArr = marMemes.concat(filenamesArr);
    });
  });
////////////////////////////////////////////////////////

const getMemeById = (req, res) => {
  if (Number(req.params.postId === 115))
    console.log(filenamesArr[req.params.postId]);
  if (req.params.postId > filenamesArr.length - 3) {
    res.sendFile(
      path.join(__dirname, "../Icons_and_shit", "U_have_reached_the_end.png")
    );
  } else {
    const filePath = path.join(
      __dirname,
      "..",
      "memes",
      filenamesArr[req.params.postId]
    );
    res.sendFile(filePath);
  }
};

exports.getMemeById = getMemeById;
