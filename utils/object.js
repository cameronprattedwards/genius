define([], function () {
	function ObjectWrapper(object) {
		this.object = object;
	};

	ObjectWrapper.prototype = {
		extend: function () {
			for (var i = 0; i < arguments.length; i++) {
				for (var x in arguments[i])
					this.object[x] = arguments[i][x];
			}

			return this.object;
		}
	};

	return function (object) { return new ObjectWrapper(object); };
});