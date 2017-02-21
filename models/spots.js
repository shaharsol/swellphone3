module.exports = {
  add: function(db,lat,lon,name,continent,country,region,callback){
    var spots = db.get('spots');
    spots.insert({
      lat: lat,
      lon: lon,
      name: name,
      continent: continent,
      country: country,
      region: region,
      created_at: new Date()
    },function(err,spot){
      callback(err,spot)
    })
  },
  all: function(db,callback){
    var spots = db.get('spots');
    spots.find({},function(err,spots){
      callback(err,spots)
    })
  },
  get: function(db,spotID,callback){
    var spots = db.get('spots');
    spots.findOne({_id: spotID},function(err,spot){
      callback(err,spot)
    })
  }
}
