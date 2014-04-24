define(["./RouteInterpreter", "./RouteCallbackFactory"], function (RouteInterpreter, RouteCallbackFactory) {
	function callback () {
		var loc = window.location;

		for (var i = 0; i < callbacks.length; i++) {
			var current = callbacks[i];
			if (current.regex.test(loc.pathname)) {
				var routeParameters = RouteInterpreter.interpret(current, loc.pathname, loc.search);
				current.callback.call(window, routeParameters);
				return;
			}
		}
	}

	var callbacks = [];

	function Router() {}

	Router.prototype = {
		setLocation: function (url) {
			history.pushState({}, "", url);
			callback.call(this);
		},
		registerRoute: function (pattern, fCallback) {
			var routeCallback = RouteCallbackFactory.create(pattern, fCallback);
			callbacks.push(routeCallback);
			callback.call(this);
		}
	};

	var router = new Router();

	window.onpopstate = function () {
		callback.call(router);
	};

	return router;
});