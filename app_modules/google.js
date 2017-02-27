const config = require('config')
const Vision = require('@google-cloud/vision');

const vision = Vision({
  projectId: config.get('google.projectId')
});

const terms = [ 'sea', 'ocean', 'body of water', 'coast' ]

module.exports = {
  hasSurf: function(photoUrl,callback){
    vision.detectLabels(photoUrl)
      .then(results => callback(photoUrl, results[0].some(label => terms.includes(label))))
  }
}
