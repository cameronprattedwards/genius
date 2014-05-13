define(["genius/mvc/model/observable/Observable"], function (Observable) {
	return function (initialValue) {
		var inner = new Observable(initialValue);
		var output = function () {
			if (arguments.length) {
				inner.set(arguments[0]);
				return this;
			}
			return inner.get();
		};

		output.subscribe = function () {
			return inner.subscribe.apply(inner, arguments);
		};

		output.unsubscribe = function () {
			return inner.unsubscribe.apply(inner, arguments);
		};

		output.get = function () {
			return inner.get.apply(inner, arguments);
		};

		output.set = function () {
			return inner.set.apply(inner, arguments);
		};

		return output;
	};
});