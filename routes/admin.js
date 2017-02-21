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


router.get('/spots',function(req,res,next){
	render(req,res,'admin/spots',{})
})

router.get('/spots/add',function(req,res,next){
	render(req,res,'admin/spots-add',{})
})

router.post('/spots/add',function(req,res,next){
	async.waterfall([],function(err,spot){
		if(err){
			errorHandler(req,res,next,err)
		}else{
			req.session.alert = {
				type: 'success',
				message: util.format('spot %s added succerssfully',spot.name)
			}
			res.redirect('/admin/spots')
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
