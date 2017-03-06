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
var url = require('url')

var errorHandler = require('../app_modules/error');
var flickr = require('../app_modules/flickr');
var ml = require('../app_modules/ml');

var spots = require('../models/spots');
var pics = require('../models/pics');
var users = require('../models/users');


router.get('/authorize',function(req,res,next){

	var redirect = {
		protocol: 'https',
		host: 'api.instagram.com',
		pathname: '/oauth/authorize/',
		query: {
			client_id: config.get('instagram.client_id'),
			redirect_uri: 'http://' + config.get('instagram.redirect_domain') + '/instagram/authorized',
			scope: 'public_content',
			response_type: 'code',
		}
	}
	res.redirect(url.format(redirect));

})

router.get('/authorized',function(req,res,next){
	async.waterfall([
		// get access token
		function(callback){
			var form = {
				client_id: config.get('instagram.client_id'),
				client_secret: config.get('instagram.client_secret'),
				grant_type: 'authorization_code',
				redirect_uri: 'http://' + config.get('instagram.redirect_domain') + '/instagram/authorized',
				code: req.query.code
			}
			request.post('https://api.instagram.com/oauth/access_token',{form: form},function(error,response,body){
				if(error){
					callback(error)
				}else if(response.statusCode >= 300){
					callback(body)
				}else{
					var data = JSON.parse(body)
					callback(null,data)
				}
			})
		},
		// update in db
		function(instagramData,callback){
			users.signIn(req.db,instagramData,function(err,user){
				callback(err,user)
			})
		}
	],function(err,user){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
			req.session.user = user;
			res.redirect('/')
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
