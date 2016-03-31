/**
 * DB Util
 */
var Cloudant = require('cloudant');
var Q = require('q');
var fs = require('fs');
var path = require('path');

var config = require('../config');
var dataDir = __dirname + '/../data';
var indexFile = __dirname + "/../design/indexes.json";
var db = null;

/**
 * init db instance, connect to DB
 */
exports.connDB = function() {
	console.log('DB Init ----------------');
	var deferred = Q.defer();
	var username = process.env.cloudant_username || config.cloudant_username;
	var password = process.env.cloudant_password || config.cloudant_password;
	var cloudant = Cloudant({account: username, password: password});
	// db instance
	db = cloudant.db.use(config.db_name);
	console.log('DB connected !');
	deferred.resolve(db);
	return deferred.promise;
};

/**
 * init db data
 */
exports.initData = function() {
	console.log('DB Data Init ----------------');
	var initDataDeferred = Q.defer();
	var fsReadDir = function(dir){
		console.log(dir);
		var deferred = Q.defer();
		fs.readdir(dir, function(err, files){
			if(err) {
				console.error('DB init data error !');
				deferred.reject(new Error(err));
			}
			deferred.resolve(files);
		})
		return deferred.promise;
	};
	var fsReadFile = function(files) {
		console.log(JSON.stringify(files));
		var deferred = Q.defer();
		files.forEach(function(file){
			if(file.length > 0 && path.extname(file) === '.json') {
				fs.readFile(path.join(dataDir, file), function(err, data){
					if(err){
						console.error('DB init data, read file [%s] error', path.join(dataDir, file));
						deferred.reject(new Error(err));
					}
					data = JSON.parse(data);
					if(data && data.length > 0) {
						data.forEach(function(doc){
							doc.docType = file.substr(0, file.length-5);
							doc.at = new Date().getTime();
							db.insert(doc, function(err, dbdoc){
								if(err){
									console.error('DB init data, insert data [%s] error', JSON.stringify(doc));
									deferred.reject(new Error(err));
								}
								console.log('Inserted: ' + JSON.stringify(dbdoc));
							})
						})
					}
				})
			}
		})
		deferred.resolve();
		return deferred.promise;
	}
	
	fsReadDir(dataDir).then(fsReadFile).done(function(){
		initDataDeferred.resolve();
	});
	return initDataDeferred.promise;
}

/**
 * Init index
 */
exports.initIndex = function() {
	console.log('DB Index Init ----------------');
	var deferred = Q.defer();
	var fsReadFile = function(file) {
		var deferred1 = Q.defer();
		fs.readFile(file, function(err, data){
			if(err){
				console.error('DB init index, read file [%s] error', file);
				deferred1.reject(new Error(err));
			}
			deferred1.resolve(data);
		})
		return deferred1.promise;
	}
	var createIndex = function(data) {
		var the_promises = [];
		data = JSON.parse(data);
		if(data && data.length > 0) {
			data.forEach(function(idx){
				var deferred2 = Q.defer();
				db.index(idx, function(err, dbidx){
					if(err){
						console.error('DB init index, create index [%s] error', JSON.stringify(idx));
						deferred2.reject(new Error(err));
					}
					console.log('Created index: ' + JSON.stringify(dbidx));
					deferred2.resolve(dbidx);
				})
				the_promises.push(deferred2.promise);
			})
		}
		return Q.all(the_promises);
	} 
	fsReadFile(indexFile).then(createIndex).done(function(){
		deferred.resolve();
	});
	return deferred.promise;
}

/**
 * destroy and reset DB
 */
exports.resetDB = function() {
	console.log('DB Reset ----------------');
	var deferred = Q.defer();
	var username = process.env.cloudant_username || config.cloudant_username;
	var password = process.env.cloudant_password || config.cloudant_password;
	var cloudant = Cloudant({account: username, password: password});
	cloudant.db.destroy(config.db_name, function(err) {
		if(err) {
			console.error('DB destroy error !');
			deferred.reject(new Error(err));
		};
		// create a new db
		cloudant.db.create(config.db_name, function(err, data) {
			if(err) {
				console.error('DB create error !');
				deferred.reject(new Error(err));
			};
			// db instance
			db = cloudant.db.use(config.db_name);
			console.log('DB connected !');
			deferred.resolve(data);
		});
	});
	return deferred.promise;
}

/**
 * Index
 */
exports.index = function(json, callback) {
	console.log('DB Index ----------------\n Input: ' + JSON.stringify(json));
	var deferred = Q.defer();
	if(!json.name || !json.type || json.index) {
		console.error('DB Index error name, type or index is null!');
		deferred.reject(new Error('DB Index error name, type or index is null!'));
	}
	db.index(json, function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		}
		console.log('DB Index ----------------\n Output: ' + JSON.stringify(data));
		deferred.resolve(data);
	})
	return deferred.promise;
}

/**
 * GET by Id
 */
exports.get = function(json) {
	console.log('DB Get ----------------\n Input: ' + JSON.stringify(json));
	var deferred = Q.defer();
	if(!json._id) {
		console.error('DB Get error _id is null!');
		deferred.reject(new Error('DB Get error _id is null!'));
	}
	db.get(json._id, function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		} else{
			console.log('DB Get ----------------\n Output: ' + JSON.stringify(data));
			deferred.resolve(data);
		}
	});
	return deferred.promise;
}

/**
 * find
 */
exports.find = function(json) {
	console.log('DB Find ----------------\n Input: ' + JSON.stringify(json));
	var deferred = Q.defer();
	db.find(json, function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		}
		console.log('DB Find ----------------\n Output: ' + JSON.stringify(data.docs));
		deferred.resolve(data.docs);
	})
	return deferred.promise;
}

/**
 * insert
 */
exports.insert = function(json) {
	console.log('DB Insert ----------------\n Input: ' + JSON.stringify(json));
	var deferred = Q.defer();
	db.insert(json, function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		}
		console.log('DB Insert ----------------\n Output: ' + JSON.stringify(data));
		deferred.resolve(data);
	})
	return deferred.promise;
}

/**
 * update
 * _id, _rev are required
 */
exports.update = function(json) {
	console.log('DB Update ----------------\n Input: ' + JSON.stringify(json));
	var deferred = Q.defer();
	if(!json._id || !json._rev) {
		console.error('DB Update error _id or _rev is null!');
		deferred.reject(new Error('DB Update error _id or _rev is null!'));
	}
	db.insert(json, function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		}
		console.log('DB Update ----------------\n Output: ' + JSON.stringify(data));
		deferred.resolve(data);
	})
	return deferred.promise;
}

/**
 * delete
 * _id, _rev are required
 */
exports.remove = function(json) {
	console.log('DB Remove ----------------\n Input: ' + JSON.stringify(json));
	var deferred = Q.defer();
	if(!json._id || !json._rev) {
		console.error('DB Remove error _id or _rev is null!');
		deferred.reject(new Error('DB Remove error _id or _rev is null!'));
	}
	db.destroy(json._id, json._rev, function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		} else{
			console.log('DB Remove ----------------\n Output: ' + JSON.stringify(data));
			deferred.resolve(data);
		}
	})
	return deferred.promise;
}

/**
 * Insert one attachement
 */
exports.attInsert = function(filepath, docname, attname, contenttype) {
	console.log('DB AttInsert ----------------\n filepath: ' + filepath + ', docname: ' + docname + ', attname: ' + attname + ', contenttype: ' + contenttype);
	var deferred = Q.defer();
	fs.createReadStream(filepath).pipe(
		db.attachement.insert(docname, attname, null, contenttype, function(err, data) {
			if(err) {
				console.error(err);
				deferred.reject(new Error(err));
			} else{
				console.log('DB AttInsert ----------------\n Output: ' + JSON.stringify(data));
				deferred.resolve(data);
			}
		})
	);
	return deferred.promise;
}

exports.mulInsert = function() {
	console.log('DB MulInsert ----------------\n Input: ');
	var deferred = Q.defer();
	fs.readFile(__dirname + '/../../public/tmp/newapp-icon.png', function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		} else  {
			console.log('inserting...');
	    	db.multipart.insert({ _id: 'icon', docType: 'image' }, [{name: 'icon.png', data: data, content_type: 'image/png'}], 'mydoc', function(err, data) {
	        	if(err) {
					console.error(err);
					deferred.reject(new Error(err));
				} else{
					console.log('DB MulInsert ----------------\n Output: ' + JSON.stringify(data));
					deferred.resolve(data);
				}
	    	});
	  	}
	});
	return deferred.promise;
}

exports.mulGet = function() {
	console.log('DB MulGet ----------------\n Input: ');
	var deferred = Q.defer();
	console.log('get data ...');
	db.multipart.get('mydoc', function(err, data) {
    	if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		} else{
			console.log('DB MulGet ----------------\n Output: ' + JSON.stringify(data._attachments['icon.png'][data]));
			deferred.resolve(data._attachments['icon.png']['data']);
		}
	});
	return deferred.promise;
}

/**
 * Get one attachement
 */
exports.attGet = function(docname, attname) {
	console.log('DB AttGet ----------------\n docname: ' + docname + ', attname: ' + attname);
	var deferred = Q.defer();
	db.attachement.get(docname, attname, function(err, data) {
		if(err) {
			console.error(err);
			deferred.reject(new Error(err));
		} else {
			console.log('DB AttInsert ----------------\n Output: ' + JSON.stringify(data));
			deferred.resolve(data);
		}
	})
	return deferred.promise;
}
