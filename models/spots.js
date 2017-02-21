module.exports = {
  add: function(db,lat,lon,name,continent,country,region,callback){
    var spots = db.get('spors');
    spots.insert({
      lat: lat,
      lon: lon,
      name: name,
      continent: continent,
      country: country,
      region: region,
      created_at: new Date()
    })
  },
  all: function(db,callback){
    var spots = db.get('spors');
    spots.find({},function(err,spots){
      callback(err,spots)
    })
  }
}
