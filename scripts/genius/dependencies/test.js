define("genius/Backend", ["./utils/deferred"], function (deferred) {
	var methods = ["create", "read", "update", "del"],
		deferreds = {},
		expectations = {};

	for (var x = 0; x < methods.length; x++) {
		deferreds[methods[x]] = {};
		expectations[methods[x]] = {};
	}

	var expectObj = {};
	for (var x = 0; x < methods.length; x++) {
		(function () {
			var method = methods[x];
			expectObj[method] = function (url) {
				return {
					toReturn: function (data) {
						expectations[method][url] = data;
					}
				}
			}
		}());
	}

	console.log(methods, deferreds, expectations);

	var output = {};

	for (var x = 0; x < methods.length; x++) {
		(function () {
			var method = methods[x];
			output[method] = function (url) {
				var def = deferred();
				deferreds[method][url] = def;
				return def.promise();
			};
		}());
	}

	output.expect = expectObj;

	output.flush = function () {
		for (var method in expectations) {
			for (var url in expectations[method]) {
				deferreds[method][url].resolve(expectations[method][url]);
				delete deferreds[method][url];
				delete expectations[method][url];
			}
		}
	}

	return output;
});