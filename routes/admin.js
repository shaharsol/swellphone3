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
var alertIcons = require('../app_modules/alert-icons');

var spots = require('../models/spots');
var pics = require('../models/pics');

router.get('/',function(req,res,next){
	render(req,res,'admin/index',{})
})

router.get('/spots',function(req,res,next){

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
			render(req,res,'admin/spots',{
				spots: spots
			})
		}
	})
})

router.get('/spots/add',function(req,res,next){
	render(req,res,'admin/spots-add',{})
})

router.post('/spots/add',function(req,res,next){
	async.waterfall([
		function(callback){
			spots.add(req.db,req.body.lat,req.body.lon,req.body.name,req.body.continent,req.body.country,req.body.region,function(err,spot){
				callback(err,spot)
			})
		}
	],function(err,spot){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
			req.session.alert = {
				type: 'success',
				message: util.format('spot %s added successfully',spot.name)
			}
			res.redirect('/admin/spots')
		}
	})
})


router.get('/classify',function(req,res,next){

	async.waterfall([
		function(callback){
			pics.getNextUnclassified(req.db,function(err,pic){
				callback(err,pic)
			})
		}
	],function(err,pic){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
console.log('pic to classify is %s',util.inspect(pic))
			render(req,res,'admin/classify',{
				pic: pic,
				active_page: 'classify'
			})
		}
	})

})

router.post('/classify',function(req,res,next){
	async.waterfall([
		function(callback){
			pics.classify(req.db,req.body.pic_id,req.body.has_surf,function(err,pic){
				callback(err,pic)
			})
		}
	],function(err,pic){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
			req.session.alert = {
				type: 'success',
				message: util.format('pic %s clasified successfully',pic._id)
			}
			res.redirect('/admin/classify')
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

	params.alertIcons = alertIcons;
	params.alert = req.session.alert;
	delete req.session.alert;

	// params.user = req.session.user;

	if(!('active_page' in params)){
		params.active_page = false;
	}

	// if(!('isHomepage' in params)){
	// 	params.isHomepage = false;
	// }

	res.render(template,params);
}
module.exports = router;
