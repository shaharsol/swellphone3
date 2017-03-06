module.exports = {
  signIn: function(db,instagramData,callback){
    var users = db.get('users')
    users.findOneAndUpdate({
      'instagram.user.id': instagramData.user.id
    },{
      $set: {
        instagram: instagramData
      }
    },{
      upsert: true,
      new: true
    },function(err,user){
      callback(err,user)
    })
  }
}
