define([], function () {
	function RouteInterpreter() {};

	RouteInterpreter.prototype = {
		interpret: function (routeCallback, pathname, search) {
			var fields = [];
			var regex = /:([^\/\-]*)/g;
			var match;
			while (match = regex.exec(routeCallback.pattern))
				fields.push({ key: match[1] });

			match = routeCallback.regex.exec(pathname);
			for (var i = 0; i < match.length - 1; i++)
				fields[i].value = match[i + 1];

			var output = {};
			for (var i = 0; i < fields.length; i++)
				output[fields[i].key] = decodeURIComponent(fields[i].value);

			return output;
		}
	};

	return new RouteInterpreter();
});