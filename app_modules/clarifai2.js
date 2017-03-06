var _ = require('lodash');
var config = require('config');

// Require the client
var Clarifai = require('clarifai');

module.exports = {
    hasSurf: function (photoUrl, callback) {

        // instantiate a new Clarifai app passing in your clientId and clientSecret
        var app = new Clarifai.App(config.get('clarifai2.api_key'), config.get('clarifai2.secret'));

        var model = 'surfModel2',
            hassurf2 = null,
            nosurf2 = null;

        app.models.predict(model, photoUrl).then(
            function (response) {

                var concepts = JSON.parse(JSON.stringify(response.outputs[0].data.concepts));

                hassurf2 = _.find(concepts, {id:'hassurf2'});
                nosurf2 = _.find(concepts, {id:'nosurf2'});

                callback(null, parseFloat(hassurf2.value) >= parseFloat(nosurf2.value));

            },
            function (err) {
                console.error(err);
            }
        );


    }
}
