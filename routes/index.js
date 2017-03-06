var express = require('express');
var router = express.Router();
var util = require('util');
var config = require('config');
var url = require('url');
var async = require('async');
var request = require('request');
var _ = require('underscore');
var basicAuth = require('basic-auth');
var moment = require('moment')


var errorHandler = require('../app_modules/error');
var flickr = require('../app_modules/flickr');
var instagram = require('../app_modules/instagram');
var ml = require('../app_modules/ml');

var spots = require('../models/spots');
var pics = require('../models/pics');


router.get('/',function(req,res,next){
	async.waterfall([
		function(callback){
			spots.all(req.db,function(err,spots){
				callback(err,spots)
			})
		}
	],function(err,spots){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
			render(req,res,'index/index',{
				spots: spots,
			})
		}
	})
})

router.get('/spot/:spot_id',function(req,res,next){
	async.waterfall([
		// load spot
		function(callback){
			spots.get(req.db,req.params.spot_id,function(err,spot){
				callback(err,spot)
			})
		},
		// get last pic for spot, so to filter the flickr apu call according to date taken
		function(spot,callback){
			pics.getLastForSpot(req.db,req.params.spot_id,function(err,lastPicForSpot){
				callback(err,spot,lastPicForSpot)
			})
		},
// 		// get photos from flickr
// 		function(spot,lastPicForSpot,callback){
// 			var since = lastPicForSpot.length > 0 ? lastPicForSpot[0].date_taken : null;
// 			console.log('lastPicForSpot is %s',util.inspect(lastPicForSpot))
// console.log('since is %s',util.inspect(since))
// 			flickr.geoSearch(spot.lat,spot.lon,1,since,function(err,photos){
// 				callback(err,spot,photos)
// 			})
// 		},
		// get photos from instagram
		function(spot,lastPicForSpot,callback){
			var since = lastPicForSpot.length > 0 ? lastPicForSpot[0].date_taken : moment().subtract(7,'days').toDate();
			console.log('lastPicForSpot is %s',util.inspect(lastPicForSpot))
console.log('since is %s',util.inspect(since))
			instagram.geoSearch(spot.lat,spot.lon,200,since,req.session.user.instagram.access_token,function(err,photos){
				callback(err,spot,photos)
			})
		},
		// pass each photo trhough the ML
		function(spot,photos,callback){
			console.log('will async each over %s photos',photos.length)
			async.eachLimit(photos,1,function(photo,callback){
				async.waterfall([
					// process the photo via ML
					function(callback){
						ml.hasSurf(photo.url,function(err,hasSurf){
							callback(err,hasSurf)
						})
					},
					// insert to db
					function(hasSurf,callback){
						pics.addFromInstagram(req.db,photo.url,photo.date_taken,spot._id.toString(),photo.instagram,hasSurf,function(err,pic){
							callback(err,pic)
						})
					}
				],function(err){
					callback(err)
				})
			},function(err){
				callback(err,spot)
			})
		},
		// fetch photos to display
		function(spot,callback){
			if(req.query.unfiltered){
				pics.getAllForSpot(req.db,req.params.spot_id,function(err,pics){
					callback(err,spot,pics)
				})
			}else{
				pics.getForSpotWithSurf(req.db,req.params.spot_id,function(err,pics){
					callback(err,spot,pics)
				})
			}
		}
	],function(err,spot,pics){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
			render(req,res,'index/spot',{
				spot: spot,
				pics: pics
			})
		}
	})
})

router.get('/feed/',function(req,res,next){
	async.waterfall([
		function(callback){
			flickr.geoSearch(req.query.lat,req.query.lon,req.query.radius,function(err,photos){
				callback(err,photos)
			})
		},
	],function(err,photos){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
			render(req,res,'index/feed',{
				photos: photos
			})
		}
	})

})

function render(req,res,template,params){

	params.app = req.app;
	params._ = _;
	// params.us = us;
	params.moment = moment;
	params.config = config;
	params.util = util;

	// params.alertIcons = alertIcons;
	// params.alert = req.session.alert;
	// delete req.session.alert;

	// params.user = req.session.user;

	// if(!('active_page' in params)){
	// 	params.active_page = false;
	// }
	//
	// if(!('isHomepage' in params)){
	// 	params.isHomepage = false;
	// }

	res.render(template,params);
}
module.exports = router;
