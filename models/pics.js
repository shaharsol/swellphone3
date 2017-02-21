var moment = require('moment')

module.exports = {
  getLastForSpot: function(db,spotID,callback){
    var pics = db.get('pics');
    pics.find({spot_id: spotID},{sort:{date_taken:-1},limit:1},function(err,pic){
      callback(err,pic)
    })
  },
  getForSpot: function(db,spotID,callback){
    var pics = db.get('pics');
    pics.find({spot_id: spotID},{sort:{taken_at:-1}},function(err,pics){
      callback(err,pics)
    })
  },
  add: function(db,url,dateTaken,spotID,mlHasSurf,callback){
    var pics = db.get('pics');
    pics.insert({
      spot_id: spotID,
      url: url,
      ml_has_surf: hasSurf,
      date_taken: moment(dateTaken).toDate()
    },function(err,pic){
      callback(err,pic)
    })
  },
  getNextUnclassified: function(db,callback){
    var pics = db.get('pics');
    pics.find({human_has_surf:{$exists: false}},{limit:1},function(err,pic){
      if(err){
        callback(err)
      }else if(pic.length == 0){
        callback('nothing left to claassiy')
      }else{
        callback(err,pic[0])
      }
    })
  },
  classify: function(db,picID,hasSurf,callback){
    var pics = db.get('pics');
    pics.findOneAndUpdate({
      _id: picID
    },{
      $set: {
        human_has_surf: hasSurf
      }
    },{
      new: true
    },function(err,pic){
      callback(err,pic)
    })
  }
}
