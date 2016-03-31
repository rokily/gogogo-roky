/**
 * Activity
 */
var db = require('../utils/db');
var constant = require('../utils/constant');
var router = function(app) {
	app.post('/activities', function(req, res, next){
		console.log('req.body: ' + JSON.stringify(req.body));
		var res_json = JSON.parse(JSON.stringify(constant.RES));
		var input = req.body;
		input.docType = 'activity';
		input.at = new Date().getTime();
		db.insert(input).then(function(data){
			return db.get({'_id': data.id});
		}).then(function(data){
			res_json.status = constant.STATUS.success;
			res_json.message = constant.MESSAGE.success;
			res_json.data = data;
			res.send(res_json);	
		}).fail(function(err){
			res.send(err);
		});
		return next();
	});
	app.get('/activities', function(req, res, next){
		console.log('req.query: ' + JSON.stringify(req.query));
		var selector = req.query;
		selector.docType = 'activity';
		var json = {"selector": selector};
		db.find(json).then(function(data){
			var res_json = JSON.parse(JSON.stringify(constant.RES));
			res_json.status = constant.STATUS.success;
			res_json.message = constant.MESSAGE.success;
			res_json.data = data;
			res.send(res_json);	
		}).fail(function(err){
			res.send(err);
		});
		return next();
	});
	app.get('/activities/:id', function(req, res, next){
		console.log('req.parmas.id: ' + req.params.id);
		var json = {'_id': req.params.id};
		db.get(json).then(function(data){
			var res_json = JSON.parse(JSON.stringify(constant.RES));
			res_json.status = constant.STATUS.success;
			res_json.message = constant.MESSAGE.success;
			res_json.data = data;
			res.send(res_json);	
		}).fail(function(err){
			res.send(err);
		});
		return next();
	});
	app.del('/activities/:id', function(req, res, next){
		console.log('req.parmas.id: ' + req.params.id);
		var json = {'_id': req.params.id};
		db.get(json).then(function(data){
			var res_json = JSON.parse(JSON.stringify(constant.RES));
			if(data._id && data._rev){
				db.remove(data).then(function(data){
					res_json.status = constant.STATUS.success;
					res_json.message = constant.MESSAGE.success;
					res.send(res_json);	
				}).fail(function(err){
					res.send(err);
				});
			} else {
				res_json.status = constant.STATUS.fail;
				res_json.message = constant.MESSAGE.fail;
				res.send(res_json);	
			}
		}).fail(function(err){
			res.send(err);
		});
		return next();
	})
};

module.exports = router;