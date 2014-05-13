define(["genius/utils/object"], function (o) {
	var initializing;

	return function (methods) {
		initializing = true;
		var prototype = new this();
		initializing = false;

		o(prototype).extend(methods);

		function Class() {
			if (!initializing)
				this.init.apply(this, arguments);
		};

		Class.prototype = prototype;

		Class.extend = arguments.callee;

		return Class;
	}
});