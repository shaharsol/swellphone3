var config = require('../config/microsoft.json');
var microsofComputerVision = require('microsoft-computer-vision');

var keywords = {
    'wave': 0.9,
    'water sport': 0.4,
    'beach': 0.4,
    'surf': 0.9,
    'surfing': 0.9,
    'ocean': 0.9,
};

module.exports = {
  hasSurf: function(photoUrl, callback){
    microsofComputerVision.analyzeImage({
      "Ocp-Apim-Subscription-Key": config.microsoft.key,
      "content-type": "application/json",
      "url": photoUrl,
      "visual-features":"Tags"
    })
      .then((response) => {
        var tags  = response.tags.filter(tag => {
          return keywords[tag.name] !== undefined && tag.confidence > keywords[tag.name];
        });
        callback(null, (tags.length > 0));
      })
      .catch((err) => {
        callback(err);
      });
  }
};
