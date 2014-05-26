var requirejs = require("requirejs"),
	assert = require("assert");

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require,
	paths: {
		"genius": "./"
	}
});

suite("Garbago", function (done) {
	setup(function (done) {
		console.log("setting up");
		requirejs([
			"utils/spec/array",
			"utils/spec/fs",
			"utils/spec/deferred",
			"mvc/view/adapters/client/nodes/spec/Node",
			"mvc/view/adapters/client/nodes/spec/Document",
			"mvc/view/adapters/client/factories/spec/Node",
			"mvc/view/adapters/client/factories/spec/Document",
			"mvc/view/adapters/client/factories/spec/Attribute",
			"mvc/view/adapters/client/factories/spec/Html"
			], function () {
			done();
		});
	});

	suite("blah", function () {
		test("blargh", function () {
		});
	});
});