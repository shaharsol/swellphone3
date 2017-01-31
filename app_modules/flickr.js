var config = require('config')
var request = require('request')
module.exports = {
  geoSearch: function(lat,lon,radius,callback){
    var photos = [];
    var page = 1;
    var linkHeader;

    async.whilst(
      function(){
        return page;
      },
      function(callback){
        var qs = {
          method: 'flickr.photos.search',
          api_key: config.get('flicker.api_key'),
          lat: lat,
          lon: lon,
          radius: radius,
          format: 'json',
          nojsoncallback: 1
          page: page,
        }
        request('https://api.flickr.com/services/rest/',{qs: qs},function(error,response,body){
          if(error){
            callback(error);
          }else if(response.statusCode > 300){
            callback(response.statusCode + ' : ' + body);
          }else{
            var data = JSON.parse(body)
            photos = repos.concat(data.photos.photo);
            page = data.photos.page * data.photos.perpage > Number(data.photos.total) ? false : data.photos.page + 1;
            callback(null,photos);
          }
        });
      },
      function(err,photos){
        callback(err,photos)
      }
    );

  }
}
