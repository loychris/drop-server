const Twit = require('twit')
const Axios = require('axios');
const fs = require('fs');
const http = require('http');
const Drop = require("../models/drop-schema");
const { Storage } = require('@google-cloud/storage');

const { prepareDrop } = require("../util/util");


//-----------------------------------------------------------------------------------

const postToStream = (req, res, next) => {
  const { title, source, id } = req.body;
  const src = source === '9gag' ? 'https://9gag.com/gag/' + id : ''; 
  const url = `https://img-9gag-fun.9cache.com/photo/${id}_700b.jpg`; 
  const dest = `./meme${id}`

  const createdDrop = new Drop({
    title,
    creatorId: "602627eac021720012a01948",
    meme: "f",
    source: src,
    posted: new Date(),
    leftSwipers: [],
    rightSwipers: [],
    pinners: [],
    comments: []
  });

  // download File from url 
  var download = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    http.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(cb);
      });
    }).on('error', function(err) { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
  }

  download(url, dest, () => console.log('Downlaod success'));
  // const file = fs.createWriteStream(dest);
  // const request = http.get(url, (response) => {
  //   response.pipe(file);
  //   file.on('finish', () => {
  //     file.close(cb);  // close() is async, call cb after close completes.
  //   });
  // }).on('error', (err) => { // Handle errors
  //   fs.unlink(dest); // Delete the file async. (But we don't check the result)
  //   if (cb) cb(err.message);
  // });

  //////// Post Pic to GCP Bucket /////////////////////////////////////////////////////////////

  // const storage = new Storage({
  //   keyFilename: path.join(__dirname, '../drop-260521-cc0eb8f443d7.json'),
  //   projectId: 'drop-260521'
  // });
  // const memesBucket = storage.bucket('drop-meme-bucket')

  // const gcsname = `meme-${createdDrop._id}`;
  // const file = memesBucket.file(gcsname);
  // const stream = file.createWriteStream({
  //   metadata: {
  //     contentType: req.file.mimetype
  //   },
  //   resumable: false
  // });
  // stream.on('error', (err) => {
  //   req.file.cloudStorageError = err;
  //   next(err);
  // });
  // stream.on('finish', () => {
  //   req.file.cloudStorageObject = gcsname;
  // });
  // stream.end(req.file.buffer);
  //////////////////////////////////////////////////////////////////////
    
    res.json({message: "saved"})
}




//-----------------------------------------------------------------------------------

const postToInstagram = (req, res, next) => {
    console.log("Posting meme to Instagram Feed!")
    console.log(req.body)
    res.json({message: "saved"})
}

//-----------------------------------------------------------------------------------

const postToInstagramStory = (req, res, next) => {
    console.log("Posting meme to Instagram Story!")
    console.log(req.body)
    res.json({message: "saved"})

}

//-----------------------------------------------------------------------------------

function getBase64(url) {
    return Axios
      .get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'binary').toString('base64'))
  }

//-----------------------------------------------------------------------------------

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
    res.json({message: "saved"});
}

//-----------------------------------------------------------------------------------

const postToTumblr = (req, res, next) => {
    console.log("Posting meme to Tumblr!")
    console.log(req.body)
    res.json({message: "saved"})

}

//-----------------------------------------------------------------------------------

exports.postToStream = postToStream;
exports.postToInstagramStory = postToInstagramStory;
exports.postToTwitter = postToTwitter;
exports.postToTumblr = postToTumblr;
exports.postToInstagram = postToInstagram;