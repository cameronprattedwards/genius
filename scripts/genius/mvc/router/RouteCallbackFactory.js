define([], function () {
	function strToRegex(str) {
		var modifiedStr = str.replace(/\//g, "\\\/");
		modifiedStr = modifiedStr.replace(/:[^\/\-]*/g, "([^\\\/\\\-]*)");
		return new RegExp(modifiedStr + "$");
	}

	function RouteCallback() {
		this.pattern = null;
		this.regex = null;
		this.callback = null;
	};

	function RouteCallbackFactory() {};

	RouteCallbackFactory.prototype = {
		create: function (pattern, callback) {
			var output = new RouteCallback();

			output.regex = strToRegex(pattern);
			output.pattern = pattern;
			output.callback = callback;

			return output;
		}
	};

	return new RouteCallbackFactory();
});