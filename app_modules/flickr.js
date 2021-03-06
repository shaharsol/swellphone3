var config = require('config')
var request = require('request')
var async = require('async')
var _ = require('underscore')
var util = require('util')
var moment = require('moment')

module.exports = {
  geoSearch: function(lat,lon,radius,since,callback){
    var photos = [];
    var page = 1;
    var linkHeader;

    async.whilst(
      function(){
        if(photos.length > 100){
          return false
        }else{
          return page;
        }
      },
      function(callback){
        var qs = {
          method: 'flickr.photos.search',
          api_key: config.get('flickr.api_key'),
          lat: lat,
          lon: lon,
          radius: radius,
          format: 'json',
          nojsoncallback: 1,
          extras: 'date_taken,date_upload',
          per_page: 500,
          page: page,
        }
        if(since){
          qs.min_taken_date = moment(since).unix()
        }
        request('https://api.flickr.com/services/rest/',{qs: qs},function(error,response,body){
          if(error){
            callback(error);
          }else if(response.statusCode > 300){
            callback(response.statusCode + ' : ' + body);
          }else{
// console.log('flickr response: %s',body)
            var data = JSON.parse(body)
            photos = photos.concat(data.photos.photo);
            page = data.photos.page * data.photos.perpage > Number(data.photos.total) ? false : data.photos.page + 1;
            console.log('got %s in page %s, continuibg toi page %s',data.photos.photo.length,data.photos.page,page)
            callback(null,photos);
          }
        });
      },
      function(err,photos){
        var ret = [];
        _.each(photos,function(photo){
console.log('photo is %s',util.inspect(photo))
          ret.push({
            url: util.format('https://farm%s.staticflickr.com/%s/%s_%s.jpg',photo.farm,photo.server,photo.id,photo.secret),
            date_taken: photo.datetaken,
          })
        })
console.log('final ret is: %s',util.inspect(ret))
        callback(err,ret)
      }
    );

  }
}
