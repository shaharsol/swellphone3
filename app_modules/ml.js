var config = require('config')

var clarifai = require('../app_modules/clarifai')

module.exports = {
  hasSurf: function(photoUrl,callback){

    switch(config.get('app.ml_provider')){
      case 'clarifai':
        clarifai.hasSurf(photoUrl,callback);
        break;
      default:
        callback(null,false)
    }


  }
}
