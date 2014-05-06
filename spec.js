var requirejs = require("requirejs"),
	assert = require("assert");

requirejs.config({
	baseUrl: __dirname,
	nodeRequire: require
});

suite("Garbago", function (done) {
	setup(function (done) {
		console.log("setting up");
		requirejs([
			"utils/spec/array",
			"utils/spec/fs",
			"utils/spec/deferred"
			], function () {
			done();
		});
	});

	suite("blah", function () {
		test("blargh", function () {
		});
	});
});