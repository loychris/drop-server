const postToStream = (req, res, next) => {
    console.log("Posting meme to Stream!")
    console.log(req.body)
    res.json({message: "saved"})
}

const postToStreamWithTitile = (req, res, next) => {
    console.log("Posting meme to Stream with Title!")
    console.log(req.body)
    res.json({message: "saved"})

}

const postToInstagram = (req, res, next) => {
    console.log("Posting meme to Instagram Feed!")
    console.log(req.body)
    res.json({message: "saved"})
}

const postToInstagramStory = (req, res, next) => {
    console.log("Posting meme to Instagram Story!")
    console.log(req.body)
    res.json({message: "saved"})

}

const postToTwitter = (req, res, next) => {
    console.log("Posting meme to Twitter!")
    console.log(req.body)
    res.json({message: "saved"})

}

const postToTumblr = (req, res, next) => {
    console.log("Posting meme to Tumblr!")
    console.log(req.body)
    res.json({message: "saved"})

}

exports.postToStream = postToStream;
exports.postToInstagramStory = postToInstagramStory;
exports.postToStreamWithTitile = postToStreamWithTitile;
exports.postToTwitter = postToTwitter;
exports.postToTumblr = postToTumblr;
exports.postToInstagram = postToInstagram;