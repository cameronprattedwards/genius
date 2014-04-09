define(["./utils"], function (utils) {
	return function (methods) {
		var initializing = true;
		var prototype = new this();
		initializing = false;

		utils.extend(prototype, methods);

		function Class() {
			if (!initializing && typeof this.init == "function")
				this.init.apply(this, arguments);
		};

		Class.prototype = prototype;

		Class.extend = arguments.callee;

		return Class;
	}
});