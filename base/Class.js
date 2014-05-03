define([], function () {
	function Class() {};

	Class.prototype.init = function () {};

	var initializing = false;

	Class.extend = function (properties) {
		initializing = true;
		var prototype = new this();
		initializing = false;

		for (var x in properties) {
			prototype[x] = properties[x];
		}

		function Class() {
			if (!initializing)
				this.init.apply(this, arguments);
		};

		Class.prototype = prototype;

		Class.extend = arguments.callee;

		return Class;
	};

	return Class;
});