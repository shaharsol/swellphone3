var moment = require('moment')

module.exports = {
  getLastForSpot: function(db,spotID,callback){
    var pics = db.get('pics');
    pics.find({spot_id: spotID},{sort:{taken_at:-1},limit:1},function(err,pic){
      callback(err,pic)
    })
  },
  add: function(db,url,dateTaken,spotID,hasSurf,callback){
    var pics = db.get('pics');
    pics.insert({
      spot_id: spotID,
      url: url,
      has_surf: hasSurf,
      date_taken: moment(dateTaken).toDate()
    },function(err,pic){
      callback(err,pic)
    })
  }
}
