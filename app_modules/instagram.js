var config = require('config')
var request = require('request')
var async = require('async')
var _ = require('underscore')
var util = require('util')
var moment = require('moment')

module.exports = {
  geoSearch: function(lat,lon,radius,since,accessToken,callback){
console.log('inside instagram')
    var photos = [];
    var page = 1;
    var linkHeader;
    var continuePagination = true;

    var nextUrl = util.format('https://api.instagram.com/v1/media/search?lat=%s&lng=%s&radius=%s&access_token=%s',lat,lon,radius,accessToken)
    console.log('next url is %s',nextUrl)

    async.whilst(
      function(){
        return nextUrl;
      },
      function(callback){
        var qs = {
          lat: lat,
          lng: lon,
          distance: radius,
          access_token: accessToken
        }
        request(nextUrl,function(error,response,body){
          if(error){
            callback(error);
          }else if(response.statusCode > 300){
            callback(response.statusCode + ' : ' + body);
          }else{

            var data = JSON.parse(body)
console.log('isntagra response: %s',util.inspect(data,{depth:8}))
            var instagramPhotos = data.data;
console.log('got those intagram photos %s',instagramPhotos)
            var obsoleteImage = _.find(instagramPhotos,function(photo){
              var isObsolete = moment(Number(photo.created_time + '000')).isSameOrBefore(moment(since))
              if(!isObsolete){
                photos.push(photo)
              }
              return isObsolete
            })
            nextUrl = !_.isUndefined(obsoleteImage) && 'pagination' in data ? data.pagination.next_url : false
            callback(null,photos);
          }
        });
      },
      function(err,photos){
        var ret = [];
        _.each(photos,function(photo){
          ret.push({
            url: photo.images.standard_resolution.url,
            date_taken: moment(Number(photo.created_time + '000')).toDate(),
            instagram: photo
          })
        })
        callback(err,ret)
      }
    );

  }
}
