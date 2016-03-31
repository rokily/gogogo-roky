/**
 * user
 */

var db = require('../utils/db');
var Q = require('q');
var router = function(app) {
	app.get('/dictionaries/:id', function(req, res, next) {
		console.log('req.parmas.id: ' + req.params.id);
		var json = {'_id': req.params.id};
		db.get(json).then(function(data){
			res.send(data);	
		});
		return next();
	});
	
	app.get('/dictionaries', function(req, res, next) {
		console.log('req.query: ' + JSON.stringify(req.query));
		
		db.find({"selector":{"docType":"dictionary","subject":req.query.subject}}).then(function(data){
			res.send(data);
		});
		return next();
	});
};

module.exports = router;
