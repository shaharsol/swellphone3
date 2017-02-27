const config = require('config')
const Vision = require('@google-cloud/vision');
var _ = require('underscore')
const vision = Vision({
  projectId: config.get('google.projectId')
});

const terms = [ 'sea', 'ocean', 'body of water', 'coast' ]

var util = require('util')

module.exports = {
  hasSurf: function(photoUrl,callback){
console.log('entered hasSurf')
    vision.detectLabels(photoUrl)
      .then(function(results){
console.log(util.inspect(results))
        return _.intersection(results[0], terms).length > 0
      }).catch(function(error){
        console.log('err is %s',error)
      })
  }
}
