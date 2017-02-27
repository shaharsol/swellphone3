import cognitiveServices from 'cognitive-services';
import keys from '../config/microsoft.json';

const computerVision = new cognitiveServices.computerVision({
  API_KEY: keys.microsoft
});

const parameters = {
  visualFeatures: "Categories"
};

const body = {
  "url": "http://example.com/images/test.jpg"
};

module.exports = {
  hasSurf: function(photoUrl, callback){
    computerVision.analyzeImage({
      parameters,
      body
    })
      .then((response) => {
        console.log('Got response', response);
      })
      .catch((err) => {
        console.error('Encountered error making request:', err);
      });
    
    callback(null,false)
  }
};
