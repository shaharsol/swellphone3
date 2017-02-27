var _ = require('lodash');
var config = require('config');

// Require the client
var Clarifai = require('clarifai');

module.exports = {
    hasSurf: function (photoUrl, callback) {

        // instantiate a new Clarifai app passing in your clientId and clientSecret
        var app = new Clarifai.App(config.get('clarifai.api_key'), config.get('clarifai.secret'));

        app.models.predict(Clarifai.GENERAL_MODEL, photoUrl).then(
                function (response) {
                    console.log("Response");

                    var concepts = JSON.parse(JSON.stringify(response.outputs[0].data.concepts));
                    var keywords = config.get('clarifai.good_keywords');

                    // get average score
                    var avgScore = 0;
                    _.each(concepts, function (v) {
                        avgScore += v.value;
                    });
                    avgScore = avgScore / concepts.length;

                    // check if keyword above average
                    var found = [];
                    _.each(concepts, function (v) {
                        if (keywords.indexOf(v.name) > -1 && v.value >= avgScore) {
                            found.push(v.name);
                        }
                        console.log(v.name, v.value, keywords.indexOf(v.name) > -1);
                    });

                    callback(null, found.length >= keywords.length / 2);

                },
                function (err) {
                    console.error(err);
                }
        );

    }
}
