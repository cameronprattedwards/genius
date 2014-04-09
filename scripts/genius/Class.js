define(["./utils"], function (utils) {
	var initializing;

	function executeHook(hookName, hooks, args) {
		for (var x in hooks[hookName])
			hooks[hookName].apply(this, args);
	}

	function Class() {};

	Class.extend = function (objMethods, hooks) {
		executeHook("beforeExtend", hooks, arguments);

		initializing = true;
		var prototype = new this();
		initializing = false;

		executeHook("afterPrototypeCreate", hooks, arguments);

		for (var method in objMethods) {
			prototype[method] = objMethods[method];
		}

		function Class() {
			if (!initializing) {
				executeHook("beforeConstruct", hooks, arguments);

				if (typeof this.init == "function")
					this.init.apply(this, arguments);

				executeHook("afterConstruct", hooks, arguments);
			}
		};

		Class.prototype = prototype;

		Class.extend = arguments.callee;

		return Class;
	};

	return Class;
});