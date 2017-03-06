var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var partials = require('express-partials');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);

var config = require('config');
var util = require('util')
//mongo
var mongo = require('mongodb');
var monk = require('monk');
// var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/swellphone3';
var mongoUri = config.get('mongo.uri');
var db = monk(mongoUri);

var cors = require('express-cors')

var index = require('./routes/index');
var admin = require('./routes/admin');
var api = require('./routes/api');

var request = require('request');
var async = require('async')
var parseString = require('xml2js').parseString;
var _ = require('underscore');
var us = require('underscore.string')

async.waterfall([
	function(callback){
		request('https://wannasurf.com/sitemap.xml',function(error,response,body){
			callback(error,body)
		})
	},
	function(sitempBody,callback){
		parseString(sitempBody,function(err,sitemap){
			callback(err,sitemap)
		})
	},
	function(sitemap,callback){

		var spots = _.filter(sitemap.urlset.url,function(item){
			var url = item.loc[0];
			var parts = url.split('/');
			return us.startsWith(url,'http://wannasurf/spot/') && parts.length == 8
		})

		console.log(util.inspect(spots,{depth:8}))
	},
],function(err){

})
