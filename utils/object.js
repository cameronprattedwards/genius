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
		},
		pick: function () {
			var output = {};

			for (var i = 0; i < arguments.length; i++) {
				var field = arguments[i];
				if (this.object[field])
					output[field] = this.object[field];
			}

			return output;
		},
		omit: function () {
			var output = new ObjectWrapper({}).extend(this.object);
			for (var i = 0; i < arguments.length; i++) {
				var exception = arguments[i];
				delete output[exception];
			}
			return output;
		}
	};

	return function (object) { return new ObjectWrapper(object); };
});