var tests = [];

for (var file in window.__karma__.files) {
	if (window.__karma__.files.hasOwnProperty(file)) {
		if (/Test\.js$/.test(file)) {
			tests.push(file);
		}
	}
}

requirejs.config({
	baseUrl: '/base',

	paths: {},

	deps: tests,

	callback: window.__karma__.start
});

console.log("crapola2", tests);