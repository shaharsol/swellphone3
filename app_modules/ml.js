var config = require('config')

var clarifai = require('../app_modules/clarifai')
var clarifai2 = require('../app_modules/clarifai2')
var google = require('../app_modules/google')

module.exports = {
  hasSurf: function(photoUrl,callback){

    switch(config.get('app.ml_provider')){
      case 'clarifai':
        clarifai.hasSurf(photoUrl,callback);
        break;
      case 'clarifai2':
        clarifai2.hasSurf(photoUrl,callback);
        break;
      case 'google':
        google.hasSurf(photoUrl,callback);
        break;
      case 'microsoft':
        var microsoft = require('../app_modules/microsoft')
        microsoft.hasSurf(photoUrl,callback);
        break;
      default:
        callback(null,false)
    }


  }
}
