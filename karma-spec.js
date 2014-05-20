requirejs.config({
	baseUrl: "/base",
	paths: {
		'mocha'         : 'libs/mocha',
		'chai'          : 'libs/chai'
	},
	shim: {
	}
});

require(['chai'], function () {
	console.log("loaded");
});