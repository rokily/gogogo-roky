/**
 * user
 */

var db = require('../utils/db');
var constant = require('../utils/constant');
var router = function(app) {
	app.get('/users/:id', function(req, res, next) {
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
	app.get('/users', function(req, res, next) {
		console.log('req.query: ' + JSON.stringify(req.query));
		var selector = req.query;
		selector.docType = 'user';
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
	app.put('/users/:id', function(req, res, next) {
		console.log('req.parmas.id: ' + req.params.id);
		console.log('req.body: ' + JSON.stringify(req.body));
		var res_json = JSON.parse(JSON.stringify(constant.RES));
		var json = {'_id': req.params.id};
		db.get(json).then(function(data){
			if(data._id && data._rev) {
				for(var key in req.body) {
					data[key] = req.body[key];
				}
				data.at = new Date().getTime();
				db.update(data).then(function(data){
					db.get({'_id': data.id}).then(function(data){
						res_json.status = constant.STATUS.success;
						res_json.message = constant.MESSAGE.success;
						res_json.data = data;
						res.send(res_json);	
					})
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
	app.post('/users/signup', function(req, res, next) {
		console.log('req.body: ' + JSON.stringify(req.body));
		var res_json = JSON.parse(JSON.stringify(constant.RES));
		db.find({"selector":{"docType":"user","account_id":req.body.account_id}})
		.then(function(data){
			if(data.length > 0) {
				res_json.status = constant.STATUS.fail;
				res_json.message = constant.MESSAGE.signup_id;
				res.send(res_json);	
			} else {
				db.insert({"docType":"user","account_id":req.body.account_id, "account_pwd":req.body.account_pwd, "at": new Date().getTime()})
				.then(function(data){
					db.get({'_id': data.id}).then(function(data){
						res_json.status = constant.STATUS.success;
						res_json.message = constant.MESSAGE.signup_succ;
						res_json.data = data;
						res.send(res_json);	
					})
				})
			}
		}).fail(function(err){
			res.send(err);
		});
		return next();
	});
	app.post('/users/login', function(req, res, next) {
		console.log('req.body: ' + JSON.stringify(req.body));
		db.find({"selector":{"docType":"user","account_id":req.body.account_id, "account_pwd":req.body.account_pwd}})
		.then(function(data){
			var res_json = JSON.parse(JSON.stringify(constant.RES));
			if(data.length == 1) {
				res_json.status = constant.STATUS.success;
				res_json.message = constant.MESSAGE.login_succ;
				res_json.data = data;
				res.send(res_json);	
			} else if(data.length == 0) {
				db.find({"docType":"user","account_id":req.body.account_id}).then(function(data){
					if(data.length == 1) {
						res_json.status = constant.STATUS.fail;
						res_json.message = constant.MESSAGE.login_pwd;
						res.send(res_json);	
					} else if(data.length == 0) {
						res_json.status = constant.STATUS.fail;
						res_json.message = constant.MESSAGE.login_id;
						res.send(res_json);	
					}
				})
			}
		}).fail(function(err){
			res.send(err);
		});
		return next();
	});
	app.post('/users/logout', function(req, res, next) {
		console.log('req.body: ' + JSON.stringify(req.body));
		var res_json = JSON.parse(JSON.stringify(constant.RES));
		res_json.status = constant.STATUS.success;
		res_json.message = constant.MESSAGE.logout_succ;
		res.send(res_json);	
		return next();
	});
};

module.exports = router;
