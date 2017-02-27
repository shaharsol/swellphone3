const config = require('config')
const Vision = require('@google-cloud/vision');

const vision = Vision({
  auth: config.get('google.api_key')
});

const terms = [ 'sea', 'ocean', 'body of water', 'coast' ]

module.exports = {
  hasSurf: function(photoUrl,callback){
    vision.detectLabels(photoUrl)
      .then(function(results){
        return callback(photoUrl, results[0].some(function(label){
          return terms.includes(label)
        }))
      })
  }
}
