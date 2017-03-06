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
var cheerio = require('cheerio');


var spots = require('./models/spots')

async.waterfall([
	function(callback){
		request('http://magicseaweed.com/site-map.php',function(error,response,body){
			callback(error,body)
		})
	},
	function(sitemap,callback){
		var spotUrls = [];
		var $ = cheerio.load(sitemap);
		$('a').each(function(index,a){
			var href = $(this).attr('href');
			if(us.contains(href,'Surf-Report')){
				spotUrls.push($(this).attr('href'))
			}
		})
		// console.log(util.inspect(spotUrls))
		async.eachLimit(spotUrls,10,function(spotUrl,callback){

			async.waterfall([
				// load the surf report guide
				function(callback){
					var url = 'http://magicseaweed.com' + spotUrl.replace('Surf-Report','Surf-Guide')
					// console.log('loading surf report page %s',url)
					request(url,function(error,response,body){
						if(error){
							callback(error)
						}else if(response.statusCode >= 300){
							callback(body)
						}else{
							callback(null,body)

						}
					})
				},
				function(surfGuidePage,callback){
					var $ = cheerio.load(surfGuidePage);
					var lat = $('#msw-js-map').first().attr('data-lat')
					var lon = $('#msw-js-map').first().attr('data-lon')

					var region = $('.breadcrumb-overflow').first().find('li').eq(-1).find('span').first().text();
					var country = $('.breadcrumb-overflow').first().find('li').eq(-2).find('span').first().text();

					var name = $('.page-title').first().text().replace('Spot Guide','').trim()

					// console.log('lat lon are %s,%s',lat,lon)
					// console.log('region countrty  %s,%s',region,country)
					// console.log('name %s',name)

					spots.add(db,lat,lon,name,null,country,region,function(err,spot){
						callback(err,spot)
					})
				}
			],function(err,spot){
				if(!err){
					console.log('added %s/%s/%s at %s,%s',spot.country,spot.region,spot.name,spot.lat,spot.lon)
				}
				callback(err)
			})


		},function(err){
			callback(err)
		})
	},
],function(err){
	if(err){
		console.log('err in crawling: %s',err)
	}else{
		console.log('successful crawling')
	}
})
