const Twit = require('twit')
const Axios = require('axios');
const fs = require('fs');


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

function getBase64(url) {
    return Axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'binary').toString('base64'))
  }

const postToTwitter = async (req, res, next) => {
    console.log("Posting meme to Twitter!")
    console.log('BODY: ', req.body);
    const id = req.body.id.substring(10, 17)
    const url = `https://img-9gag-fun.9cache.com/photo/${id}_460s.jpg`
    const pic = getBase64(url);

    var T = new Twit({
        consumer_key:         'M4RlwYzxSsRn2RYGtqu8hK6Kl',
        consumer_secret:      'vCmUUDkYNuT2bNUYHatKwiCqhv7fuBH3s8qQGiezPfOX20yhGb',
        access_token:         '940366027132755969-KsKzHumHYXiMsOu27KbVXRablweq2nM',
        access_token_secret:  'npPuIQeFYzed8Kl8ei36BuuPoO5evn5wEcBSiC7WBnD9G',
      })

      // first we must post the media to Twitter
      var b64content = fs.readFileSync('/home/chris/drop/stream-server/memes/dez/a0R3Vnd_460s.jpg', { encoding: 'base64' })

      // first we must post the media to Twitter
      T.post('media/upload', { media_data: pic }, function (err, data, response) {
        // now we can assign alt text to the media, for use by screen readers and
        // other text-based presentations and interpreters
        var mediaIdStr = data.media_id_string
        console.log('/////////////data//////////////', data);
        var altText = "Small flowers in a planter on a sunny balcony, blossoming."
        var meta_params = { media_id: mediaIdStr}
       
        T.post('media/metadata/create', meta_params, function (err, data, response) {
            if(err) console.log(err);
          if (!err) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            var params = { status: 'this is my first media tweet', media_ids: [mediaIdStr] }
       
            T.post('statuses/update', params, function (err, data, response) {
                if(err)console.log(err);
              console.log(data)
            })
          }
        })
      })
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