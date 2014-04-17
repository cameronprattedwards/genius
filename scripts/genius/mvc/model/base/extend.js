define(["genius/utils"], function (utils) {
	var initializing;

	return function (methods) {
		initializing = true;
		var prototype = new this();
		initializing = false;

		utils.extend(prototype, methods);

		function Class() {
			if (!initializing)
				this.init.apply(this, arguments);
		};

		Class.prototype = prototype;

		Class.extend = arguments.callee;

		return Class;
	}
});