/**
 * http://usejsdoc.org/
 */
var db = require('./utils/db');

var router = function(app) {
	app.get('/admin/initData', function(req, res, next){
		db.initData().done(function(){
			res.send('Init Data Done !');
		});
		return next();
	})
	app.get('/admin/initIndex', function(req, res, next){
		db.initIndex().done(function(){
			res.send('Init Index Done !');
		});
		return next();
	})
	
	app.get('/admin/resetDB', function(req, res, next){
		db.resetDB().done(function(data){
			res.send('Reset DB Done ! -- ' + JSON.stringify(data));
		});
		return next();
	})
};

module.exports = router;