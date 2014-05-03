define(["mongojs", "genius/config", "genius/utils/deferred"], function (mongojs, config, deferred) {
	var dbConfig = config.get().db,
		url = dbConfig.url,
		collections = dbConfig.collections,
		db = mongojs.connect(url, collections);

	function MongoAdapter() {};

	MongoAdapter.prototype = {
		create: function (collectionName, object) {
			var output = deferred();
			db[collectionName].insert(object, function (err, savedObject) {
				if (err)
					return output.reject(err);

				output.resolve(savedObject);
			});
			return output.promise();
		},
		read: function (collectionName, id) {
			var output = deferred(),
				callback = function (err, returnedObject) {
					if (err)
						return output.reject(err);

					output.resolve(returnedObject);
				},
				collection = db[collectionName];

			if (id)
				collection.findOne({ "_id": id }, callback);
			else
				collection.find(callback);

			return output.promise();
		},
		update: function (collectionName, id, changedFields) {
			var output = deferred();
			db[collectionName].update({ "_id": id }, changedFields, { multi: false }, function (err, updatedObject) {
				if (err)
					return output.reject(err);

				output.resolve(changedFields);
			});
			return output.promise();
		},
		del: function (collectionName, id) {
			var output = deferred();
			db[collectionName].remove({ "_id": id }, function (err) {
				if (err)
					return output.reject(err);

				output.resolve();
			});
			return output.promise();
		}
	};

	return new MongoAdapter();
});