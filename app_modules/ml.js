var config = require('config')

var clarifai = require('../app_modules/clarifai')
var google = require('../app_modules/google')
var microsoft = require('../app_modules/microsoft')

module.exports = {
  hasSurf: function(photoUrl,callback){

    switch(config.get('app.ml_provider')){
      case 'clarifai':
        clarifai.hasSurf(photoUrl,callback);
        break;
      case 'google':
        google.hasSurf(photoUrl,callback);
        break;
      case 'microsoft':
        microsoft.hasSurf(photoUrl,callback);
        break;
      default:
        callback(null,false)
    }


  }
}
